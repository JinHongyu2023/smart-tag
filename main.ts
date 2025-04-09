import { App, Modal, Plugin, PluginSettingTab, Setting, Notice, TFile } from 'obsidian';
import SmartTagPluginSettingsTab from './settings';


export interface SmartTagPluginSettings {
	apiKey: string;
	endpoint: string;
	modelName: string;
	tagCount: number;
	fieldTags: string[];    // 预设的领域标签列表
	autoReplace: boolean;
	historyFilePath: string;
	defaultFieldTag: string;  // 最近使用的领域标签，作为默认选择
}

const DEFAULT_SETTINGS: SmartTagPluginSettings = {
	apiKey: '',
	endpoint: 'https://api.openai.com/v1/chat/completions',
	modelName: 'gpt-3.5-turbo',
	tagCount: 5,
	fieldTags: ['修行'],
	autoReplace: true,
	historyFilePath: '.obsidian/plugins/smart-tag/history.json',
	defaultFieldTag: '修行'
};

export default class SmartTagPlugin extends Plugin {
	settings: SmartTagPluginSettings;

	async onload() {
		console.log('加载 SmartTag 插件');
		await this.loadSettings();

		// 注册生成智能标签的命令
		this.addCommand({
			id: 'generate-smart-tags',
			name: '生成智能标签',
			checkCallback: (checking: boolean) => {
				const leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						this.generateSmartTags();
					}
					return true;
				}
				return false;
			}
		});

		// 添加插件设置页
		this.addSettingTab(new SmartTagPluginSettingsTab(this.app, this));
	}

	onunload() {
		console.log('卸载 SmartTag 插件');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		// 如果没有默认领域标签，则以 fieldTags 的第一个为默认
		if (!this.settings.defaultFieldTag && this.settings.fieldTags.length > 0) {
			this.settings.defaultFieldTag = this.settings.fieldTags[0];
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// 主流程：生成智能标签、排序、写入笔记及保存历史记录
	async generateSmartTags() {
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice('请先打开一篇笔记！');
			return;
		}

		// 弹窗让用户选择领域标签（默认上次使用的）
		const selectedFieldTag = await new FieldTagSelectionModal(
			this.app,
			this.settings.fieldTags,
			this.settings.defaultFieldTag || (this.settings.fieldTags[0] || '')
		).openAndGetValue();

		// 更新默认领域标签设置
		this.settings.defaultFieldTag = selectedFieldTag;
		await this.saveSettings();

		// 读取当前笔记内容
		const content = await this.app.vault.read(file);
		new Notice('正在调用 LLM 生成智能标签...');

		// 调用 LLM 接口生成推荐标签数组
		const recommendedTags = await this.callLLMService(content);

		// 加载历史记录，并统计当前领域中各推荐标签的出现频率
		const historyRecords = await this.loadHistoryRecords();
		const freqMap = this.getStableTagFrequencies(historyRecords, selectedFieldTag);
		// 对推荐标签按照历史出现频率降序排序
		const sortedRecommendedTags = this.sortTagsByHistory(recommendedTags, freqMap);

		// 生成最终标签数组：第一项为领域标签，其余为 "领域标签/推荐标签" 格式
		const finalTags = [selectedFieldTag];
		sortedRecommendedTags.forEach(tag => {
			finalTags.push(`${selectedFieldTag}/${tag}`);
		});

		// 写入 YAML Frontmatter
		await this.writeTagsToFile(file, finalTags);
		new Notice('智能标签已成功写入笔记！');

		// 保存当前生成记录到历史记录中
		const record = {
			notePath: file.path,
			noteTitle: file.basename,
			fieldTag: selectedFieldTag,
			recommendedTags: sortedRecommendedTags,
			timestamp: new Date().toISOString(),
			// 可选：保存原始 LLM 响应（这里记录原始推荐标签，方便调试）
			llmResponse: JSON.stringify(recommendedTags)
		};
		await this.saveHistoryRecord(record);
	}


    // 调用 LLM 接口生成智能标签，要求返回 JSON 数组格式
    async callLLMService(content: string): Promise<string[]> {
        const prompt = `请从以下文本中提取 ${this.settings.tagCount} 个核心标签。
    请只返回严格的 JSON 数组，不要任何额外解释或代码块（例如不要包含 \`\`\`json 或 \`\`\` 这类内容）。
    示例：["标签1", "标签2", "标签3"]。
    只输出数组即可，不要任何其它字符。
    
    文本：
    ${content}`;
        try {
        const response = await fetch(this.settings.endpoint, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.settings.apiKey}`
            },
            body: JSON.stringify({
            model: this.settings.modelName,
            messages: [{
                role: 'user',
                content: prompt
            }],
            max_tokens: 100
            })
        });
        const data = await response.json();
        let text = data.choices[0].message.content.trim();
        
        // 移除可能出现的代码块标记，例如 ```json 和 ```
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        let tags: string[] = [];
        try {
            // 尝试直接解析 JSON 数组
            tags = JSON.parse(text);
            if (!Array.isArray(tags)) {
            throw new Error("解析结果不是数组");
            }
        } catch (error) {
            console.warn('JSON.parse 失败，尝试按换行符拆分：', error);
            // fallback：按换行符拆分
            tags = text.split('\n').map(t => t.trim()).filter(t => t);
        }
        // 去重并过滤空字符串
        tags = Array.from(new Set(tags.filter(tag => tag)));
        return tags;
        } catch (error) {
        console.error('调用 LLM 接口错误：', error);
        new Notice('调用 LLM 接口错误，请检查配置。');
        return [];
        }
    }
    


	// 将生成的标签写入当前笔记的 YAML Frontmatter 中
	async writeTagsToFile(file: TFile, tags: string[]) {
		let content = await this.app.vault.read(file);
		const yamlRegex = /^---\n([\s\S]*?)\n---/;
		if (yamlRegex.test(content)) {
			const newYaml = `tags:\n  - ${tags.join('\n  - ')}`;
			const newContent = content.replace(yamlRegex, `---\n${newYaml}\n---`);
			await this.app.vault.modify(file, newContent);
		} else {
			const yamlBlock = `---\ntags:\n  - ${tags.join('\n  - ')}\n---\n\n`;
			await this.app.vault.modify(file, yamlBlock + content);
		}
	}

	// -------------------------- 历史记录模块 --------------------------
	// 读取历史记录文件，返回记录数组
	async loadHistoryRecords(): Promise<any[]> {
        try {
          const file = this.app.vault.getAbstractFileByPath(this.settings.historyFilePath);
          if (file) {
            // 使用 adapter 读取可能能获取最新内容
            const content = await this.app.vault.adapter.read(this.settings.historyFilePath);
            return JSON.parse(content);
          } else {
            return [];
          }
        } catch (error) {
          console.error("读取历史记录失败", error);
          return [];
        }
      }

	// 保存一条历史记录到文件中
   
    async saveHistoryRecord(record: any) {
        try {
          let records = await this.loadHistoryRecords();
          console.log("保存前读取到历史记录条数：", records.length);
          records.push(record);
          console.log("新增记录后，记录条数：", records.length);
          const jsonStr = JSON.stringify(records, null, 2);
          const file = this.app.vault.getAbstractFileByPath(this.settings.historyFilePath);
          if (file) {
            await this.app.vault.modify(file, jsonStr);
          } else {
            await this.app.vault.create(this.settings.historyFilePath, jsonStr);
          }
          console.log("写入文件内容：", jsonStr);
        } catch (error) {
          console.error("保存历史记录失败", error);
        }
      }
      

	// 根据选定领域标签统计历史记录中的推荐标签出现频率
	getStableTagFrequencies(historyRecords: any[], fieldTag: string): Map<string, number> {
		const freq = new Map<string, number>();
		for (const record of historyRecords) {
			if (record.fieldTag === fieldTag && record.recommendedTags) {
				for (const tag of record.recommendedTags) {
					freq.set(tag, (freq.get(tag) || 0) + 1);
				}
			}
		}
		return freq;
	}

	// 根据频率对推荐标签进行排序（频率高的排前面）
	sortTagsByHistory(recommendedTags: string[], freqMap: Map<string, number>): string[] {
		return recommendedTags.sort((a, b) => {
			const freqA = freqMap.get(a) || 0;
			const freqB = freqMap.get(b) || 0;
			return freqB - freqA;
		});
	}
}

// -------------------------- 领域标签选择弹窗 --------------------------

export class FieldTagSelectionModal extends Modal {
	fieldOptions: string[];
	selectedValue: string;
	resolve: (value: string) => void;
	promise: Promise<string>;

	constructor(app: App, fieldOptions: string[], defaultValue: string) {
		super(app);
		this.fieldOptions = fieldOptions;
		this.selectedValue = defaultValue;
		this.promise = new Promise((resolve) => {
			this.resolve = resolve;
		});
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// 标题
		contentEl.createEl('h2', { text: '请选择领域标签' });

		// 说明文字，让用户知道可以下拉选择并按回车确认
		const hintEl = contentEl.createEl('p', {
			text: '请在下拉框中选择或修改领域标签，然后按 "确认"（或键盘回车）完成。'
		});
		hintEl.style.marginBottom = '1em';

		// 创建 label 与下拉选择框
		const labelEl = contentEl.createEl('label', { text: '可选领域标签：' });
		labelEl.style.display = 'block';
		labelEl.style.marginBottom = '0.5em';

		const selectEl = contentEl.createEl('select');
		selectEl.style.marginRight = '1em';

		// 生成下拉选项
		this.fieldOptions.forEach(opt => {
			const optionEl = selectEl.createEl('option', { text: opt });
			optionEl.value = opt;
			if (opt === this.selectedValue) {
				optionEl.selected = true;
			}
		});

		labelEl.appendChild(selectEl);

		selectEl.onchange = (evt: Event) => {
			const target = evt.target as HTMLSelectElement;
			this.selectedValue = target.value;
		};

		// 确认按钮
		const confirmBtn = contentEl.createEl('button', { text: '确认' });
		confirmBtn.style.marginRight = '1em';
		confirmBtn.onclick = () => {
			this.resolve(this.selectedValue);
			this.close();
		};

		// 默认将焦点移到确认按钮
		// 这样按回车即可提交，无需鼠标操作
		window.setTimeout(() => {
			confirmBtn.focus();
		}, 0);

		// 取消按钮
		const cancelBtn = contentEl.createEl('button', { text: '取消' });
		cancelBtn.onclick = () => {
			// 取消时也返回当前选择的值（或可改成返回空）
			this.resolve(this.selectedValue);
			this.close();
		};
	}

	onClose() {
		this.contentEl.empty();
	}

	// 打开弹窗并返回用户选择的值
	openAndGetValue(): Promise<string> {
		this.open();
		return this.promise;
	}
}

