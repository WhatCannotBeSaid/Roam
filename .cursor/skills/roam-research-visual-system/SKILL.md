---
name: roam-research-visual-system
description: Roam Research project-specific visual system. Extends typography skill. Use when editing roam.css, Roam JS blocks, theme variables, dark mode, or Roam UI/UX styling.
---

# Roam Research 日夜统一视觉系统

**本技能继承 typography 技能**；以下为 Roam 项目专有约束与资源。

构建具备「感知一致性」的日夜统一视觉系统。**设计风格**：无边界、沉浸式—以内容为中心，减少视觉割裂与界面「框感」。

## 核心协议（Roam 专有）

### 锁定项

- **配色**：色值仅限 https://colors.masantu.com/#/ ；不得替换或重定义既有配色变量/值。
- **字体**：修改须遵循 **typography** 技能；roam.css 仅允许 color + font-family + font-size（见 roam-css-properties 规则）。

### 可修改

布局、间距、字号与行高、组件结构、交互态、滚动条与选中、变量逻辑（非色值）、性能优化等；字体与配色在 typography 与本协议约束下可调整。

### A. 样式约束

- **DOM 匹配**：选择器须严格匹配 [index.html](index.html) 中实际存在的类/ID/结构，严禁猜测。

### B. 配色（继承 typography § 二，Roam 实现）

- **变量**：`--m-` 前缀；`:root` / `.rm-dark-theme` 下定义；引用须带 fallback。
- **APCA**：日间 Lc ≥ 75；夜间 Lc ∈ [60, 80]，严禁纯白文字。
- **交互态**：优先用 `oklch()` 从 `--m-` 变量派生。

### C. 工程与性能

- 避免 `!important`；优化 MutationObserver 等，避免打字延迟。

### D. 设计风格（无边界、沉浸式）

- **无边界**：少边框、分割线、卡片描边；内容与背景自然过渡。
- **沉浸式**：少 chrome、装饰元素；留白与内容一体，满幅/全屏体验。

---

## Roam 专有资源

- **色值来源**：仅 https://colors.masantu.com/#/ ；变量 `--m-` 在 `:root` / `.rm-dark-theme` 下定义；作用域 `.roam-app`。
- **滚动条与选中**：须使用 `--m-` 变量，不得硬编码。
- **APCA 细则**：见 [reference.md](reference.md)。

## 工作流检查清单

编辑前：色值来自 colors.masantu.com；选择器匹配 [index.html](index.html)；遵循 typography 技能与 roam-css-properties 规则。

编辑后：日夜切换无闪烁/位移；无意外覆盖 font-family 与配色；无 MutationObserver 导致的打字延迟；保持无边界、沉浸式。

## 参考与模板

- APCA 细则：[reference.md](reference.md)
- DOM：[index.html](index.html)
- 样式架构：[system.css](system.css)、[things.css](things.css)
