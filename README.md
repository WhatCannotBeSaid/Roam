# Roam Research 深度优化套件 (roam)

这是一个面向 Roam Research 的主题与交互增强组合，当前由两部分组成：

- `roam.css`：完整视觉系统（配色、字体、组件主题覆盖、日夜模式一致性）
- `Roam.js`：三态主题切换与 Excalidraw 主题同步逻辑

目标是提供统一、沉浸、可读性高且可长期维护的使用体验。

## ✨ 主要特性

### 🎨 视觉系统 (roam.css)

- **语义化主题变量**：使用 `--m-*` 及映射变量统一管理日间/夜间配色与组件色彩。
- **分角色字体体系**：为 `title / heading / body / quote / tag / code / ui` 分别配置字栈与回退链。
- **模块化样式结构**：按章节组织（Variables、Typography、Code Blocks、Tags、Settings、Dark Mode、References 等），便于维护与扩展。
- **全局组件一致性覆盖**：对 Blueprint UI、命令面板、设置页、引用区、弹层等统一主题语义，减少原生内联样式带来的视觉割裂。
- **日夜统一体验**：夜间模式采用与日间对应的语义变量与交互色，尽量保持信息层级一致。

`roam.css` 当前章节：

1. CSS Variables (Light)  
2. Global Overrides  
3. Base Layout  
4. Typography  
5. Code Blocks  
6. Embed & Query  
7. 左侧边栏  
8. Block References & Blockquote  
10. Kanban  
11. Tags & Labels  
12. Highlights  
13. Settings & Plugins  
15. Dark Mode  
17. Gap-Filling & Global Resets  
18. References - Borderless Immersion

> 注：章节编号保留历史演进痕迹（如 9/14/16 预留），不影响功能。

### 🔌 交互增强 (Roam.js)

- **三态主题切换**：`auto -> light -> dark` 循环切换，状态持久化在 `localStorage`（键：`roam-theme-mode`）。
- **系统主题联动**：`auto` 模式下监听 `prefers-color-scheme` 变化并实时切换。
- **Topbar 按钮注入**：自动在顶栏插入切换按钮，图标随模式更新（`repeat / flash / moon`）。
- **Excalidraw 主题同步**：同步 `.excalidraw` 根节点 `theme--dark / theme--light`，并处理：
  - Roam 主题 class 变化
  - Excalidraw 节点新增
  - 全屏切换

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
- `Roam.js` 当前只负责主题切换与 Excalidraw 同步，不再包含早期的其它独立小功能。

## 📄 开源协议

本项目采用 [MIT License](LICENSE)。
