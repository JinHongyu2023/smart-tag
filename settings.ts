import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import SmartTagPlugin from './main';

export default class SmartTagPluginSettingsTab extends PluginSettingTab {
	plugin: SmartTagPlugin;

	constructor(app: App, plugin: SmartTagPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'SmartTag 智能标签助手设置' });
		
		// API Key 配置
		new Setting(containerEl)
			.setName('API Key')
			.setDesc('输入你的 OpenAI API Key')
			.addText(text => text
				.setPlaceholder('请输入 API Key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value.trim();
					await this.plugin.saveSettings();
				}));
				
		// LLM Endpoint 配置
		new Setting(containerEl)
			.setName('LLM Endpoint')
			.setDesc('例如：https://api.openai.com/v1/chat/completions')
			.addText(text => text
				.setPlaceholder('请输入 Endpoint')
				.setValue(this.plugin.settings.endpoint)
				.onChange(async (value) => {
					this.plugin.settings.endpoint = value.trim();
					await this.plugin.saveSettings();
				}));
				
		// 模型名称配置
		new Setting(containerEl)
			.setName('模型名称')
			.setDesc('例如：gpt-3.5-turbo')
			.addText(text => text
				.setPlaceholder('请输入模型名称')
				.setValue(this.plugin.settings.modelName)
				.onChange(async (value) => {
					this.plugin.settings.modelName = value.trim();
					await this.plugin.saveSettings();
				}));
				
		// 推荐标签数量配置
		new Setting(containerEl)
			.setName('推荐标签数量')
			.setDesc('默认 5，范围 2～8')
			.addSlider(slider => slider
				.setLimits(2, 8, 1)
				.setValue(this.plugin.settings.tagCount)
				.onChange(async (value) => {
					this.plugin.settings.tagCount = value;
					await this.plugin.saveSettings();
				}));
				
		// 领域标签管理配置
		new Setting(containerEl)
			.setName('管理领域标签')
			.setDesc('用逗号分隔多个领域标签，例如：修行,商业,AI 或 修行，商业，AI')
			.addText(text => text
				.setPlaceholder('例如：修行,商业,AI')
				.setValue(this.plugin.settings.fieldTags.join(','))
				.onChange(async (value) => {
					this.plugin.settings.fieldTags = value
						.split(/[,，]/) // 同时识别英文逗号/中文逗号
						.map(str => str.trim())
						.filter(str => str);

					// 如果默认领域标签不在新配置中，更新默认为第一个
					if (!this.plugin.settings.fieldTags.includes(this.plugin.settings.defaultFieldTag)) {
						this.plugin.settings.defaultFieldTag = this.plugin.settings.fieldTags[0] || '';
					}
					await this.plugin.saveSettings();
				}));
				
		// 是否自动覆盖旧推荐标签
		new Setting(containerEl)
			.setName('是否自动覆盖旧推荐标签')
			.setDesc('开启后，每次推荐将覆盖已有的推荐标签')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoReplace)
				.onChange(async (value) => {
					this.plugin.settings.autoReplace = value;
					await this.plugin.saveSettings();
				}));
				
		// 历史记录存储路径配置
		new Setting(containerEl)
			.setName('历史记录存储路径')
			.setDesc('默认：.obsidian/plugins/smart-tag/history.json')
			.addText(text => text
				.setPlaceholder('设置历史记录保存路径')
				.setValue(this.plugin.settings.historyFilePath)
				.onChange(async (value) => {
					this.plugin.settings.historyFilePath = value.trim();
					await this.plugin.saveSettings();
				}));
				
		// 检测 LLM 配置按钮
		new Setting(containerEl)
			.setName('检测 LLM 配置')
			.setDesc('点击按钮测试当前配置是否可用')
			.addButton(button => button
				.setButtonText('测试配置')
				.onClick(async () => {
					try {
						const response = await fetch(this.plugin.settings.endpoint, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${this.plugin.settings.apiKey}`
							},
							body: JSON.stringify({
								model: this.plugin.settings.modelName,
								messages: [{ role: 'user', content: '你好' }],
								max_tokens: 10
							})
						});
						if (response.ok) {
							new Notice('LLM 配置正确！');
						} else {
							new Notice('配置测试失败，请检查 API Key 与 Endpoint');
						}
					} catch (e) {
						console.error(e);
						new Notice('调用测试时发生错误，请检查配置。');
					}
				}));
	}
}
