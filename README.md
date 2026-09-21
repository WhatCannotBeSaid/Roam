# Roam Research 深度优化套件 (roam)

这是一个面向 Roam Research 的主题与交互增强组合，当前由两部分组成：

- `roam.css`：完整视觉系统（配色、字体、组件主题覆盖、日夜模式一致性）
- `Roam.js`：三档主题（自动 / 日间 / 夜间）与顶栏切换按钮、Excalidraw 主题同步、`￥￥ → $$$$` 数学输入快捷键

目标是提供统一、沉浸、可读性高且可长期维护的使用体验。

## ✨ 主要特性

### 🎨 视觉系统 (roam.css)

- **语义化主题变量**：使用 `--m-*` 及映射变量统一管理日间/夜间配色与组件色彩。
- **分角色字体体系**：为 `title / heading / body / quote / tag / code / ui` 分别配置字栈与回退链。
- **模块化样式结构**：按章节组织（Variables、Typography、Code Blocks、Tags、Settings、Dark Mode、References 等），便于维护与扩展。
- **全局组件一致性覆盖**：对 Blueprint UI、命令面板、设置页、引用区、弹层等统一主题语义，减少原生内联样式带来的视觉割裂。
- **日夜统一体验**：夜间模式采用与日间对应的语义变量与交互色，尽量保持信息层级一致。

`roam.css` 当前章节：

1. CSS Variables（日间 :root + 夜间 .rm-dark-theme）  
2. Global Overrides  
3. Base Layout  
4. Typography  
5. Code Blocks  
6. Embed & Query  
7. 左侧边栏（含右侧边栏、bullet）  
8. Block References & Blockquote  
9. Kanban  
10. Diagram  
11. Tags & Labels  
12. Highlights  
13. Settings & Plugins  
14. Dark Mode  
15. Gap-Filling & Global Resets  
16. References - Borderless Immersion  
17. Command Palette  
18. PDF 与杂项修复  
19. Excalidraw  
20. Mind Map

> 注：章节编号已按实际顺序重排为连续的 1–20（2026-09 全量优化），不再有预留号。

### 🔌 交互增强 (Roam.js)

- **主题三档 + 顶栏切换按钮**：在顶栏最右侧注入 `#roam-theme-toggle-btn`（Blueprint 原生按钮样式，随主题着色），点击循环「自动 → 日间 → 夜间」；图标 `repeat / flash / moon`，`title` 提示当前档位（如「跟随系统 (当前夜间) · 点击切换」）。偏好存 `localStorage["roam-theme-mode"]`，**手动档优先于系统**。
- **系统主题监听（仅 auto 档）**：`matchMedia("(prefers-color-scheme: dark)")` 的 `change`（及旧版 `addListener`）触发时，仅当档位为 `auto` 才重新应用主题；手动档保持用户选择。
- **顶栏重渲染兜底**：起步阶段最多重试 50×200ms 建按钮；此后每 2s 仅做一次 `id` 查询补建（无 DOM 遍历，不影响输入延迟）。
- **Excalidraw 主题同步**：同步 `.excalidraw` 根节点 `theme--dark / theme--light`，并处理：
  - Roam 主题 class 变化
  - Excalidraw 节点新增
  - 全屏切换
- **数学输入快捷键**：
  - `￥￥` → `$$$$`：在 block 中输入两个全角 `￥￥` 时，自动替换为 `$$$$` 并把光标停在中间（两对 `$$` 之间），可直接键入公式；单个 `￥` 保持原样。
  - **回车跳出 `$$...$$`**：当光标位于一对未闭合的 `$$...$$` 内部时，按回车不再换行/新建块，而是把光标挪到闭合 `$$` 之后，便于直接续写正文。
  - 仅作用于 Roam block 文本域（`#block-input-*` / `.rm-block__input`）
  - 通过 `execCommand("insertText")` 走浏览器原生输入通路，等价于 Roam 自带 `【【 → [[]]` 的实现，自动同步 React `value tracker` 与 undo 历史
  - 同时监听 `input` / `compositionend` / `keydown`，覆盖英文键盘与中文 IME 两条输入通路

## 🚀 安装与部署

### 1) 部署 CSS

1. 在 Roam 中创建页面 `roam/css`。
2. 新建代码块（`/code`，语言选 `CSS`）。
3. 粘贴 [roam.css](roam.css) 全部内容。

### 2) 部署 JavaScript

1. 在 Roam 中创建页面 `roam/js`。
2. 首次执行脚本时，在 Roam 提示中点击 *"Yes, I know what I'm doing"* 授权。
3. 新建代码块（`/code`，语言选 `JavaScript`）。
4. 粘贴 [Roam.js](Roam.js) 全部内容并刷新页面。

## 📝 维护说明

- 主题相关逻辑优先集中在 `roam.css` 变量层，减少散点硬编码。
- `Roam.js` 当前包含主题三档与顶栏切换按钮、系统主题监听、Excalidraw 同步、数学输入快捷键与标签 `#` 前缀隐藏等独立逻辑块，均以 IIFE 组织，便于单独维护与裁剪。

## 📄 开源协议

本项目采用 [MIT License](LICENSE)。
