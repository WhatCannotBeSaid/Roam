# Roam Research 深度优化套件 (roam)

这是一个针对 Roam Research 的深度优化方案，包含精心设计的 **CSS 主题**与** JavaScript 增强插件**，旨在提供沉浸、护眼且高效的写作与管理体验。

## ✨ 主要特性

### 🎨 护眼配色方案 (CSS)
*   **日间模式**：以米黄（`#F5F0E6`）为底，搭配墨青（`#2A5A6A`）主色，采用低饱和度的中国传统色，阅读舒适。
*   **夜间模式**：适配 `roam-native-dark`，使用深灰（`#2A2A2A`）背景与柔和的文字颜色，降低视觉疲劳。
*   **精美排版**：标题使用 Futura / 颜真卿楷体，正文使用 Optima / 空山楷，代码使用 Fira Code。

### 🛠 UI/UX 功能增强 (CSS)
*   **沉浸式代码块**：无边框设计，透明背景，专注于代码内容。
*   **增强复选框**：完成任务后自动添加优雅的删除线样式，且复选框自动隐藏。
*   **智能搜索框**：集成同步状态指示灯，支持动态展开。
*   **标签美化**：为 `#Tweet`, `#Book`, `#Idea` 等特定标签定制了专属样式。

### 🔌 插件增强 (JavaScript)
*   **[Sidebar-Hide.js](Sidebar-Hide.js)**：**悬浮侧边栏**。禁用原生侧边栏占位，鼠标移至屏幕左侧边缘时自动滑出，离开后自动隐藏。
*   **[TDD Sidebar.js](TDD%20Sidebar.js)**：**待办入口**。在侧边栏顶部注入快捷入口，一键跳转至 `TODO` 和 `Done` 页面。
*   **[Heading-Enter-Normal.js](Heading-Enter-Normal.js)**：**标题回车变正文**。在 h1/h2/h3 标题块按 Enter 时，将新块改为普通正文块，而非继续为同级标题。

## 🚀 安装与使用

### 1. 安装 CSS 主题
1.  在 Roam Research 中创建一个名为 `roam/css` 的页面。
2.  创建一个代码块（输入 `/code` 并选择 `CSS`）。
3.  将 [roam.css](roam.css) 的内容粘贴进去。
4.  推荐搭配 **Roam Native Dark** 扩展使用以获得最佳夜间效果。

### 2. 安装 JavaScript 插件
1.  在 Roam Research 中创建一个名为 `roam/js` 的页面。
2.  **信任该页面**：点击页面顶部的 "Yes, I know what I'm doing" 按钮（如果出现）。
3.  为每个插件分别创建代码块（输入 `/code` 并选择 `JavaScript`）：
    *   **悬浮侧边栏**：复制 [Sidebar-Hide.js](Sidebar-Hide.js) 内容并粘贴。
    *   **TDD 入口**：复制 [TDD Sidebar.js](TDD%20Sidebar.js) 内容并粘贴。
    *   **标题回车变正文**：复制 [Heading-Enter-Normal.js](Heading-Enter-Normal.js) 内容并粘贴。在 h1/h2/h3 标题块按 Enter 后，新块会变为普通正文块（Roam 默认会继续为同级标题）。
4.  将代码块下方的语言下拉菜单设置为 `javascript`。

## 📝 最近更新 (2026-02-02)
*   **项目更名**：由 `Roam-CSS` 正式更名为 `roam`。
*   **代码清理**：移除了冗余的选择器，统一了 CSS 变量命名。
*   **插件优化**：优化了侧边栏悬浮触发的灵敏度。

## 🤝 致谢
*   本套件由 **Antigravity (Gemini)** 辅助开发与优化。
