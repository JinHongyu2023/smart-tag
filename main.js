var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// main.ts
var main_exports = {};
__export(main_exports, {
  FieldTagSelectionModal: () => FieldTagSelectionModal,
  default: () => SmartTagPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// settings.ts
var import_obsidian = require("obsidian");
var SmartTagPluginSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    __publicField(this, "plugin");
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "SmartTag \u667A\u80FD\u6807\u7B7E\u52A9\u624B\u8BBE\u7F6E" });
    new import_obsidian.Setting(containerEl).setName("API Key").setDesc("\u8F93\u5165\u4F60\u7684 OpenAI API Key").addText((text) => text.setPlaceholder("\u8BF7\u8F93\u5165 API Key").setValue(this.plugin.settings.apiKey).onChange(async (value) => {
      this.plugin.settings.apiKey = value.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("LLM Endpoint").setDesc("\u4F8B\u5982\uFF1Ahttps://api.openai.com/v1/chat/completions").addText((text) => text.setPlaceholder("\u8BF7\u8F93\u5165 Endpoint").setValue(this.plugin.settings.endpoint).onChange(async (value) => {
      this.plugin.settings.endpoint = value.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u6A21\u578B\u540D\u79F0").setDesc("\u4F8B\u5982\uFF1Agpt-3.5-turbo").addText((text) => text.setPlaceholder("\u8BF7\u8F93\u5165\u6A21\u578B\u540D\u79F0").setValue(this.plugin.settings.modelName).onChange(async (value) => {
      this.plugin.settings.modelName = value.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u63A8\u8350\u6807\u7B7E\u6570\u91CF").setDesc("\u9ED8\u8BA4 5\uFF0C\u8303\u56F4 2\uFF5E8").addSlider((slider) => slider.setLimits(2, 8, 1).setValue(this.plugin.settings.tagCount).onChange(async (value) => {
      this.plugin.settings.tagCount = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u7BA1\u7406\u9886\u57DF\u6807\u7B7E").setDesc("\u7528\u9017\u53F7\u5206\u9694\u591A\u4E2A\u9886\u57DF\u6807\u7B7E\uFF0C\u4F8B\u5982\uFF1A\u4FEE\u884C,\u5546\u4E1A,AI \u6216 \u4FEE\u884C\uFF0C\u5546\u4E1A\uFF0CAI").addText((text) => text.setPlaceholder("\u4F8B\u5982\uFF1A\u4FEE\u884C,\u5546\u4E1A,AI").setValue(this.plugin.settings.fieldTags.join(",")).onChange(async (value) => {
      this.plugin.settings.fieldTags = value.split(/[,，]/).map((str) => str.trim()).filter((str) => str);
      if (!this.plugin.settings.fieldTags.includes(this.plugin.settings.defaultFieldTag)) {
        this.plugin.settings.defaultFieldTag = this.plugin.settings.fieldTags[0] || "";
      }
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u662F\u5426\u81EA\u52A8\u8986\u76D6\u65E7\u63A8\u8350\u6807\u7B7E").setDesc("\u5F00\u542F\u540E\uFF0C\u6BCF\u6B21\u63A8\u8350\u5C06\u8986\u76D6\u5DF2\u6709\u7684\u63A8\u8350\u6807\u7B7E").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoReplace).onChange(async (value) => {
      this.plugin.settings.autoReplace = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u5386\u53F2\u8BB0\u5F55\u5B58\u50A8\u8DEF\u5F84").setDesc("\u9ED8\u8BA4\uFF1A.obsidian/plugins/smart-tag/history.json").addText((text) => text.setPlaceholder("\u8BBE\u7F6E\u5386\u53F2\u8BB0\u5F55\u4FDD\u5B58\u8DEF\u5F84").setValue(this.plugin.settings.historyFilePath).onChange(async (value) => {
      this.plugin.settings.historyFilePath = value.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u68C0\u6D4B LLM \u914D\u7F6E").setDesc("\u70B9\u51FB\u6309\u94AE\u6D4B\u8BD5\u5F53\u524D\u914D\u7F6E\u662F\u5426\u53EF\u7528").addButton((button) => button.setButtonText("\u6D4B\u8BD5\u914D\u7F6E").onClick(async () => {
      try {
        const response = await fetch(this.plugin.settings.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.plugin.settings.apiKey}`
          },
          body: JSON.stringify({
            model: this.plugin.settings.modelName,
            messages: [{ role: "user", content: "\u4F60\u597D" }],
            max_tokens: 10
          })
        });
        if (response.ok) {
          new import_obsidian.Notice("LLM \u914D\u7F6E\u6B63\u786E\uFF01");
        } else {
          new import_obsidian.Notice("\u914D\u7F6E\u6D4B\u8BD5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 API Key \u4E0E Endpoint");
        }
      } catch (e) {
        console.error(e);
        new import_obsidian.Notice("\u8C03\u7528\u6D4B\u8BD5\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u68C0\u67E5\u914D\u7F6E\u3002");
      }
    }));
  }
};

// main.ts
var DEFAULT_SETTINGS = {
  apiKey: "",
  endpoint: "https://api.openai.com/v1/chat/completions",
  modelName: "gpt-3.5-turbo",
  tagCount: 5,
  fieldTags: ["\u4FEE\u884C"],
  autoReplace: true,
  historyFilePath: ".obsidian/plugins/smart-tag/history.json",
  defaultFieldTag: "\u4FEE\u884C"
};
var SmartTagPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    __publicField(this, "settings");
  }
  async onload() {
    console.log("\u52A0\u8F7D SmartTag \u63D2\u4EF6");
    await this.loadSettings();
    this.addCommand({
      id: "generate-smart-tags",
      name: "\u751F\u6210\u667A\u80FD\u6807\u7B7E",
      checkCallback: (checking) => {
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
    this.addSettingTab(new SmartTagPluginSettingsTab(this.app, this));
  }
  onunload() {
    console.log("\u5378\u8F7D SmartTag \u63D2\u4EF6");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
      new import_obsidian2.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u7BC7\u7B14\u8BB0\uFF01");
      return;
    }
    const selectedFieldTag = await new FieldTagSelectionModal(
      this.app,
      this.settings.fieldTags,
      this.settings.defaultFieldTag || (this.settings.fieldTags[0] || "")
    ).openAndGetValue();
    this.settings.defaultFieldTag = selectedFieldTag;
    await this.saveSettings();
    const content = await this.app.vault.read(file);
    new import_obsidian2.Notice("\u6B63\u5728\u8C03\u7528 LLM \u751F\u6210\u667A\u80FD\u6807\u7B7E...");
    const recommendedTags = await this.callLLMService(content);
    const historyRecords = await this.loadHistoryRecords();
    const freqMap = this.getStableTagFrequencies(historyRecords, selectedFieldTag);
    const sortedRecommendedTags = this.sortTagsByHistory(recommendedTags, freqMap);
    const finalTags = [selectedFieldTag];
    sortedRecommendedTags.forEach((tag) => {
      finalTags.push(`${selectedFieldTag}/${tag}`);
    });
    await this.writeTagsToFile(file, finalTags);
    new import_obsidian2.Notice("\u667A\u80FD\u6807\u7B7E\u5DF2\u6210\u529F\u5199\u5165\u7B14\u8BB0\uFF01");
    const record = {
      notePath: file.path,
      noteTitle: file.basename,
      fieldTag: selectedFieldTag,
      recommendedTags: sortedRecommendedTags,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      // 可选：保存原始 LLM 响应（这里记录原始推荐标签，方便调试）
      llmResponse: JSON.stringify(recommendedTags)
    };
    await this.saveHistoryRecord(record);
  }
  // 调用 LLM 接口生成智能标签，要求返回 JSON 数组格式
  async callLLMService(content) {
    const prompt = `\u8BF7\u4ECE\u4EE5\u4E0B\u6587\u672C\u4E2D\u63D0\u53D6 ${this.settings.tagCount} \u4E2A\u6838\u5FC3\u6807\u7B7E\u3002
    \u8BF7\u53EA\u8FD4\u56DE\u4E25\u683C\u7684 JSON \u6570\u7EC4\uFF0C\u4E0D\u8981\u4EFB\u4F55\u989D\u5916\u89E3\u91CA\u6216\u4EE3\u7801\u5757\uFF08\u4F8B\u5982\u4E0D\u8981\u5305\u542B \`\`\`json \u6216 \`\`\` \u8FD9\u7C7B\u5185\u5BB9\uFF09\u3002
    \u793A\u4F8B\uFF1A["\u6807\u7B7E1", "\u6807\u7B7E2", "\u6807\u7B7E3"]\u3002
    \u53EA\u8F93\u51FA\u6570\u7EC4\u5373\u53EF\uFF0C\u4E0D\u8981\u4EFB\u4F55\u5176\u5B83\u5B57\u7B26\u3002
    
    \u6587\u672C\uFF1A
    ${content}`;
    try {
      const response = await fetch(this.settings.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.settings.apiKey}`
        },
        body: JSON.stringify({
          model: this.settings.modelName,
          messages: [{
            role: "user",
            content: prompt
          }],
          max_tokens: 100
        })
      });
      const data = await response.json();
      let text = data.choices[0].message.content.trim();
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      let tags = [];
      try {
        tags = JSON.parse(text);
        if (!Array.isArray(tags)) {
          throw new Error("\u89E3\u6790\u7ED3\u679C\u4E0D\u662F\u6570\u7EC4");
        }
      } catch (error) {
        console.warn("JSON.parse \u5931\u8D25\uFF0C\u5C1D\u8BD5\u6309\u6362\u884C\u7B26\u62C6\u5206\uFF1A", error);
        tags = text.split("\n").map((t) => t.trim()).filter((t) => t);
      }
      tags = Array.from(new Set(tags.filter((tag) => tag)));
      return tags;
    } catch (error) {
      console.error("\u8C03\u7528 LLM \u63A5\u53E3\u9519\u8BEF\uFF1A", error);
      new import_obsidian2.Notice("\u8C03\u7528 LLM \u63A5\u53E3\u9519\u8BEF\uFF0C\u8BF7\u68C0\u67E5\u914D\u7F6E\u3002");
      return [];
    }
  }
  // 将生成的标签写入当前笔记的 YAML Frontmatter 中
  async writeTagsToFile(file, tags) {
    let content = await this.app.vault.read(file);
    const yamlRegex = /^---\n([\s\S]*?)\n---/;
    if (yamlRegex.test(content)) {
      const newYaml = `tags:
  - ${tags.join("\n  - ")}`;
      const newContent = content.replace(yamlRegex, `---
${newYaml}
---`);
      await this.app.vault.modify(file, newContent);
    } else {
      const yamlBlock = `---
tags:
  - ${tags.join("\n  - ")}
---

`;
      await this.app.vault.modify(file, yamlBlock + content);
    }
  }
  // -------------------------- 历史记录模块 --------------------------
  // 读取历史记录文件，返回记录数组
  async loadHistoryRecords() {
    try {
      const file = this.app.vault.getAbstractFileByPath(this.settings.historyFilePath);
      if (file) {
        const content = await this.app.vault.adapter.read(this.settings.historyFilePath);
        return JSON.parse(content);
      } else {
        return [];
      }
    } catch (error) {
      console.error("\u8BFB\u53D6\u5386\u53F2\u8BB0\u5F55\u5931\u8D25", error);
      return [];
    }
  }
  // 保存一条历史记录到文件中
  async saveHistoryRecord(record) {
    try {
      let records = await this.loadHistoryRecords();
      console.log("\u4FDD\u5B58\u524D\u8BFB\u53D6\u5230\u5386\u53F2\u8BB0\u5F55\u6761\u6570\uFF1A", records.length);
      records.push(record);
      console.log("\u65B0\u589E\u8BB0\u5F55\u540E\uFF0C\u8BB0\u5F55\u6761\u6570\uFF1A", records.length);
      const jsonStr = JSON.stringify(records, null, 2);
      const file = this.app.vault.getAbstractFileByPath(this.settings.historyFilePath);
      if (file) {
        await this.app.vault.modify(file, jsonStr);
      } else {
        await this.app.vault.create(this.settings.historyFilePath, jsonStr);
      }
      console.log("\u5199\u5165\u6587\u4EF6\u5185\u5BB9\uFF1A", jsonStr);
    } catch (error) {
      console.error("\u4FDD\u5B58\u5386\u53F2\u8BB0\u5F55\u5931\u8D25", error);
    }
  }
  // 根据选定领域标签统计历史记录中的推荐标签出现频率
  getStableTagFrequencies(historyRecords, fieldTag) {
    const freq = /* @__PURE__ */ new Map();
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
  sortTagsByHistory(recommendedTags, freqMap) {
    return recommendedTags.sort((a, b) => {
      const freqA = freqMap.get(a) || 0;
      const freqB = freqMap.get(b) || 0;
      return freqB - freqA;
    });
  }
};
var FieldTagSelectionModal = class extends import_obsidian2.Modal {
  constructor(app, fieldOptions, defaultValue) {
    super(app);
    __publicField(this, "fieldOptions");
    __publicField(this, "selectedValue");
    __publicField(this, "resolve");
    __publicField(this, "promise");
    this.fieldOptions = fieldOptions;
    this.selectedValue = defaultValue;
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "\u8BF7\u9009\u62E9\u9886\u57DF\u6807\u7B7E" });
    const hintEl = contentEl.createEl("p", {
      text: '\u8BF7\u5728\u4E0B\u62C9\u6846\u4E2D\u9009\u62E9\u6216\u4FEE\u6539\u9886\u57DF\u6807\u7B7E\uFF0C\u7136\u540E\u6309 "\u786E\u8BA4"\uFF08\u6216\u952E\u76D8\u56DE\u8F66\uFF09\u5B8C\u6210\u3002'
    });
    hintEl.style.marginBottom = "1em";
    const labelEl = contentEl.createEl("label", { text: "\u53EF\u9009\u9886\u57DF\u6807\u7B7E\uFF1A" });
    labelEl.style.display = "block";
    labelEl.style.marginBottom = "0.5em";
    const selectEl = contentEl.createEl("select");
    selectEl.style.marginRight = "1em";
    this.fieldOptions.forEach((opt) => {
      const optionEl = selectEl.createEl("option", { text: opt });
      optionEl.value = opt;
      if (opt === this.selectedValue) {
        optionEl.selected = true;
      }
    });
    labelEl.appendChild(selectEl);
    selectEl.onchange = (evt) => {
      const target = evt.target;
      this.selectedValue = target.value;
    };
    const confirmBtn = contentEl.createEl("button", { text: "\u786E\u8BA4" });
    confirmBtn.style.marginRight = "1em";
    confirmBtn.onclick = () => {
      this.resolve(this.selectedValue);
      this.close();
    };
    window.setTimeout(() => {
      confirmBtn.focus();
    }, 0);
    const cancelBtn = contentEl.createEl("button", { text: "\u53D6\u6D88" });
    cancelBtn.onclick = () => {
      this.resolve(this.selectedValue);
      this.close();
    };
  }
  onClose() {
    this.contentEl.empty();
  }
  // 打开弹窗并返回用户选择的值
  openAndGetValue() {
    this.open();
    return this.promise;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FieldTagSelectionModal
});
