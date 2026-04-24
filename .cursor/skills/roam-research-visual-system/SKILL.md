---
name: roam-research-visual-system
description: Roam Research project-specific visual system. Extends typography skill. Use when editing roam.css, Roam JS blocks, theme variables, dark mode, or Roam UI/UX styling.
---

# Roam Research 日夜统一视觉系统

**本技能继承 typography 技能**；以下为 Roam 项目专有约束与资源。

构建具备「感知一致性」的日夜统一视觉系统。**设计风格**：无边界、沉浸式—以内容为中心，减少视觉割裂与界面「框感」。

## 核心协议（Roam 专有）

### 锁定项（铁律）

- **配色值锁定**：已定义的配色变量（`--m-*`、`--text-color`、`--bg` 等）与选择器上的色值**不得修改、替换或重定义**；新增样式**只能引用**既有变量。色值来源仅限 https://colors.masantu.com/#/ 。
- **字体值锁定**：已定义的字体栈变量（`--body-font`、`--heading-font`、`--code-font`、`--ui-font` 等）与选择器上的 `font-family` **不得修改、替换或重定义**；新增样式**只能引用**既有变量；字号（`--fs-*`）同理。
- **属性范围锁定**：roam.css 仅允许 color 类 + `font-family` + `font-size`（详见 roam-css-properties 规则）。
- **唯一解锁方式**：用户**明确要求**修改字体 / 配色时才可动；任何重构、清理、优化、新增 DOM 适配都必须保持字体与配色的最终计算值不变。

### 可修改

- 在**不改动既有字体/配色值**的前提下：新增选择器引用既有变量、补齐未主题化的 DOM、合并重复规则、清理注释与空白、调整变量逻辑（非色值/非字体值）、性能优化等。
- 版式、结构、间距、行高、动效**不在 roam.css 作用域内**，交由 blueprint.css / site.css / Roam 默认控制。

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
- **APCA 细则**：见 [typography/reference.md](../typography/reference.md)。

## 工作流检查清单

**编辑前**：
- 用户是否**明确要求**修改字体或配色？若否，字体与配色值（变量与具体值）**一律不动**，只能新增引用既有变量的规则。
- 选择器匹配 [index.html](index.html)；遵循 typography 技能与 roam-css-properties 规则。
- 色值来自 colors.masantu.com（仅在用户要求新增配色时适用）。

**编辑后**：
- **diff 中没有任何字体栈 / 色值的替换或重写**（仅允许新增引用、删除整条失效规则、或注释/空白清理）。
- 日夜切换无闪烁 / 位移；无 MutationObserver 导致的打字延迟；保持无边界、沉浸式。

## 参考与模板

- APCA 细则：[typography/reference.md](../typography/reference.md)
- DOM：[index.html](index.html)
- 样式架构：[blueprint.css](blueprint.css)、[site.css](site.css)
