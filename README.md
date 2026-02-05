# Roam Research 深度优化套件 (roam)

针对 Roam Research 的深度优化方案，包含 **roam.css** 主题与 **Roam.js** 增强脚本，提供日夜统一、护眼且沉浸的写作与管理体验。

---

## ✨ 主要特性

### 🎨 roam.css — 主题与排版

* **日夜统一视觉**  
  日间：苍艾底（`#C7D1C6`）、墨色正文、竹青主色、靛青引用条等；夜间：玄青底（`#2B333E`）、月影白正文、石青主色、雪青引用条等。配色来自中国传统色，APCA 对比度合规（日间 Lc≥75，夜间 Lc 60–80），无纯白刺眼。

* **字栈（Humanist Endgame）**  
  页面标题 `--title-font`（Domaine Display / 柳公权楷书）、标题级 `--heading-font`（Canela / 古典明朝楷）、正文 `--body-font`（Tiempos Text / 屏显雅宋）、引用 `--quote-font`（Calligraph421 BT / 文悦古典明朝体）、标签 `--tag-font`、代码 `--code-font`（Operator Mono / 霞鹜文楷等）、UI `--ui-font`（Ideal Sans / 艺黑等）。

* **字号与层次**  
  页面标题 `--fs-page-title`（2.4rem）、H1/H2/H3（1.8 / 1.5 / 1.25rem）、正文 `--fs-body`（1rem）、引用 `--fs-quote`（1.05rem）、标签 `--fs-tag`（1.05rem）；展示态与编辑态共用同一变量，所见即所得。

* **组件与交互**  
  引用块左侧靛青/雪青竖条、hover 加深；沉浸式代码块（透明背景、无框）；行内/块级高亮、双链/外链色与主色/引用条区分；同步状态指示、搜索高亮、自动完成；笑脸复选框样式由 CSS 定义（见下）；看板、标签、References 无框沉浸等。

* **结构概览**  
  CSS 分为：变量（日/夜）→ 全局覆盖 → 基础布局 → 排版 → 代码块 → 嵌入与查询 → 左侧边栏 → 块引用与引用块 → 复选框（笑脸）→ 看板 → 标签与高亮 → 设置与插件 → 自动完成 → 夜间合并覆盖 → 主题切换按钮 → 间隙与重置 → 引用区沉浸。

### 🔌 Roam.js — 脚本增强

* **Theme Toggle（日夜切换）**  
  在顶栏注入切换按钮，循环模式：**自动（跟随系统）→ 日间 → 夜间**。偏好写入 `localStorage`（`roam-theme-mode`），自动模式下监听 `prefers-color-scheme`。按钮图标：自动 `repeat`、日间 `flash`、夜间 `moon`；悬停显示当前模式与「点击切换」。

* **Smile CheckBox（笑脸复选框）**  
  在 `.check-container .checkmark` 内注入笑脸元素（`.smiley-face`），与 roam.css 中的笑脸样式配合；通过 MutationObserver 与点击事件在动态生成的块上补注，避免遗漏。标签样式仅由 roam.css 提供，本脚本不包含标签逻辑。

---

## 🚀 安装与使用

### 1. 安装 CSS 主题（roam.css）

1. 在 Roam Research 中创建页面 **roam/css**。
2. 新建代码块，类型选 **CSS**。
3. 将 [roam.css](roam.css) 全部内容粘贴进该代码块。

### 2. 安装 JavaScript（Roam.js）

1. 在 Roam Research 中创建页面 **roam/js**。
2. 若出现提示，点击 **“Yes, I know what I'm doing”** 信任该页面。
3. 新建代码块，类型选 **JavaScript**，将 [JS/Roam.js](JS/Roam.js)（或仓库根目录下的 Roam.js）全部内容粘贴进去。
4. 将代码块语言设置为 **javascript**。

安装后即可使用顶栏主题切换与笑脸复选框；若使用系统深色模式，建议在 Roam 内选择「自动」以匹配 roam.css 夜间变量。

---

## 📁 仓库文件说明

| 文件 | 说明 |
|------|------|
| [roam.css](roam.css) | 主题样式：CSS 变量（日/夜）、排版、代码块、引用块、侧栏、复选框、看板、标签、高亮、设置/插件区、主题切换按钮等。 |
| [JS/Roam.js](JS/Roam.js) | 合并脚本：Theme Toggle（日/夜间模式切换）+ Smile CheckBox（笑脸复选框注入）。 |

---

## 📝 最近更新（2026-02-05）

* **README**：根据当前 **roam.css** 与 **Roam.js** 重写，补充字栈、变量、结构与安装说明。
* **roam.css**：引用块字号 `--fs-quote` 设为 1.05rem；日夜配色与 APCA 规范见文件内注释。

---

## 🤝 致谢

本套件由 **Antigravity (Gemini)** 参与开发与优化。
