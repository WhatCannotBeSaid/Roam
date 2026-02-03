---
name: roam-research-visual-system
description: Reads and optimizes Roam Research CSS/JS to build a perceptually consistent day/night visual system. Uses colors from colors.masantu.com, APCA contrast validation, and DOM from index.html. Use when editing roam.css, Roam JS blocks, theme variables, dark mode, or Roam UI/UX styling.
---

# Roam Research 日夜统一视觉系统

作为 Roam Research 资深 UI/UX 架构师，读取并优化项目内所有 CSS 与 JS，构建具备「感知一致性」的日夜统一视觉系统。

## 核心协议（必须始终遵守）

### A. 样式约束

- **零动字体**：严禁修改任何 `font-family`、`font-size`、`line-height`。
- **色彩主权**：色值仅限使用 https://colors.masantu.com/#/ 。
- **DOM 匹配**：仅使用原生 DOM 结构，严禁猜测类名；选择器必须严格匹配 `index.html` 中实际存在的类/ID/结构。

### B. 算法驱动

- **APCA 校验**：日间 Lc ≥ 75；夜间 Lc ∈ [60, 80]，严禁纯白文字（#FFFFFF）。
- **协调逻辑**：主色/辅助色用类比色（ΔH ≈ 30°）；功能/强调色用分裂补色，保证高辨识度。
- **动态派生**：交互态（hover、active、focus）颜色优先用 `oklch()` 从主变量派生，保持色相一致、仅调明度/饱和度。

### C. 工程防御

- **变量驱动**：统一使用 `--m-` 前缀的 CSS 变量；通过 ID 选择器或更具体路径提升权重，避免 `!important`。
- **性能审计**：优化 `MutationObserver` 等 JS 过滤器，确保不产生打字延迟或输入卡顿。

---

## 资源与权限

- **范围**：允许 read 和 edit 项目内所有 `.css` 与 `.js` 文件；确保与现有代码逻辑互不冲突。
- 上述核心协议 A/B/C 覆盖 DOM、字体、色彩、变量与性能，其余条款不得与之冲突。

## 色彩与变量架构

### 色彩来源与变量化

- **唯一色值来源**：仅使用来自 https://colors.masantu.com/#/ 的色值（见核心协议 A）。
- **变量管理**：所有颜色通过 `:root` 中带 `--m-` 前缀的 CSS 变量定义；日夜模式共用同一套变量名，仅在 `.rm-dark-theme`（或项目内实际使用的暗色类名）下修改变量值。
- **作用域**：变量定义在 `.roam-app` 级别，确保对第三方插件 UI 的最大覆盖；所有变量引用必须带安全回退色，例如：`color: var(--m-text, #2F2F2F);`。

### APCA 极性感知校验

在写入或修改任何配色前，必须对每组前景/背景组合做 APCA 对比度校验（见核心协议 B）：

| 模式     | 极性   | 正文 Lc 要求 | 备注 |
|----------|--------|--------------|------|
| 日间模式 | 正极性 | Lc ≥ 75      | 强光环境建议目标 Lc 80 |
| 夜间模式 | 负极性 | Lc 维持在 60–80 | 禁止纯白文字；通过降低文字亮度或提高背景亮度避免光晕 |

**修正机制**：若不达标，沿相同色相（Hue）轴线调整明度，直至符合阈值。详细公式与计算方式见 [reference.md](reference.md)。

### 色相环协调

- **主色/辅助色**：类比色逻辑（ΔH ≈ 30°）。
- **功能/强调色**（如 TODO、重要标签）：分裂补色逻辑，保证高辨识度。
- **环境混色**：中性色（背景、边框）注入 3%–8% 主色饱和度，避免纯灰的廉价感。

### 交互态与 oklch 派生

- 悬停、激活、焦点等状态的颜色，优先用 `oklch()` 从 `--m-` 变量推导（例如在 L 或 C 上微调），避免硬编码新色值。

## 全域与组件约定

- **滚动条与选中**：滚动条（Scrollbar）和选中文本（Selection）必须使用与主题一致的 `--m-` 变量，不得硬编码。
- **性能**：禁止大量使用 `filter: blur()` 或复杂多层层叠阴影；JS 中若有 `MutationObserver`，需优化过滤条件与回调，避免造成打字延迟（见核心协议 C）。

## 自动化流程

### 1. 静态扫描

- 遍历所有 CSS/JS，识别硬编码颜色（除回退值外的 hex/rgb 直接书写）。
- 识别潜在选择器冲突（同一元素被多条规则以不同优先级命中）。

### 2. 依赖与覆盖关系

- 分析 roam/js 或插件可能注入的内联样式；新样式优先通过 ID 选择器或更具体的选择器路径提升权重，避免 `!important`；若必须使用，需在注释中说明原因。

### 3. 代码优化

- 合并重复声明。
- 删除冗余的 `!important`，改用更具体的选择器路径。

### 4. 最终复核（Self-Correction）

- 检查日夜模式切换时是否因 Padding/Margin 差异导致「闪烁」或「位移」。
- 确认没有任何样式意外覆盖系统字体设定（`font-family` / `font-size` / `line-height` 未被修改）。
- 若修改了 JS：确认 `MutationObserver` 等观察逻辑不会导致输入/打字延迟。

## 工作流检查清单

执行编辑前请确认：

- [ ] 色值均来自 colors.masantu.com，且已写入 `:root` / `.rm-dark-theme` 的 `--m-` 变量。
- [ ] 每组正文/背景配色已做 APCA 校验并满足 Lc 阈值（日间 ≥75，夜间 60–80）。
- [ ] 选择器仅使用 index.html 中存在的类/ID/结构，未猜测类名。
- [ ] 未改动 font-family、font-size、line-height。
- [ ] 滚动条与 Selection 使用 `--m-` 变量；变量引用带 fallback。
- [ ] 未引入过多 blur 或复杂阴影；交互态优先用 oklch() 派生。

执行编辑后请确认：

- [ ] 日夜切换无布局闪烁或位移。
- [ ] 无新增对字体的意外覆盖。
- [ ] 无因 MutationObserver/JS 导致的打字延迟。

## 参考

- APCA 计算与色相调整细则见 [reference.md](reference.md)。
- DOM 结构以项目根目录下 `index.html` 为准。
