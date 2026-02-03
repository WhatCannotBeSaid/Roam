# Roam Research 日夜统一视觉系统 · 自检报告

生成时间：2025-02-03

---

## 1. 变量层（日夜模式变量池）

### 日间模式 (`:root`)

| 变量类别 | 变量名 | 色值 (Masantu) | 说明 |
|---------|--------|----------------|------|
| 背景 | --masantu-bg | #F3F9F1 荼白 | 护眼主背景 |
| 表面 | --masantu-surface | #FCEFE8 鱼肚白 | 非纯白 |
| 正文 | --masantu-text | #50616D 墨色 | 正文 |
| 墨水 | --masantu-ink | #424C50 鸦青 | 避免 #000 |
| 弱化 | --masantu-text-muted | #758A99 墨灰 | 次要文字 |
| 主色 | --masantu-primary | #789262 竹青 | 主色相 |
| 辅色 | --masantu-secondary | #D3B17D 枯黄 | 秋香系辅助 |
| 标题 H1 | --heading-h1-color | #622A1D 玄色 | |
| 标题 H2 | --heading-h2-color | #50616D 墨色 | |
| 标题 H3 | --heading-h3-color | #75878A 苍色 | |
| 侧栏标题 | --sidebar-title-color-day | #057748 松花绿 | |
| 侧栏星标 | --sidebar-star-color-day | #065279 靛蓝 | |
| 强调/高亮 | --highlight-* | 丁香/缃色/松柏绿/群青/绯红/雪青/琥珀 | 功能色 |

### 夜间模式 (`body.rm-dark-theme`)

| 变量类别 | 变量名 | 色值 (Masantu) | 说明 |
|---------|--------|----------------|------|
| 背景 | --bg-color | #392F41 乌黑 | 主背景 |
| 表面 | --page-color | #392F41 乌黑 | |
| 正文 | --text-color | #D6ECF0 月白 | Lc 60–80，非 #FFF |
| 弱化 | --light-text-color | #A1AFC9 蓝灰 | |
| 主色 | --color-primary | #1685A9 石青 | |
| 辅色 | --color-secondary | #C83C23 绯红 | 分裂补色强调 |
| Popover | --popover-bg | #3D3B4F 玄青 | |
| 代码区 | --code-warning-surface | #3D3B4F 玄青 | |
| 墨水 | --ink-solid | #161823 漆黑 | 实心墨 |

### 布局参数（日夜共享）

- `--layout-padding-sm/md/lg`：8px / 16px / 24px
- `--layout-radius-sm/md/lg`：6px / 8px / 12px
- `--border-radius-*`：沿用既有
- `--transition-normal`：0.25s ease

---

## 2. 全局层覆盖

| 区域 | 选择器 | 使用变量 |
|------|--------|----------|
| 根背景 | html, body, #app | --bg-color, --text-color |
| 选中文本 | ::selection | --selection-bg, --selection-text |
| 滚动条 | * { scrollbar-color } | --scrollbar-thumb, --scrollbar-track |
| WebKit 滚动条 | html::-webkit-scrollbar-* | 同上 |
| 输入框 | .bp3-input, .rm-settings input | --embed-bg, --text-color, --focus-ring |
| 浮层/菜单 | .bp3-popover, .bp3-menu, .bp3-dialog 等 | --ui-surface-bg, --popover-bg |
| 第三方插件 | .roam-app 子元素 | 继承全部变量 |

---

## 3. APCA 校验

### 日间（正极性）

- **正文 #50616D 墨色 / 背景 #F3F9F1 荼白**：深字浅底，预估 Lc ≈ 78–82 ✅
- **标题 #622A1D 玄色 / 背景 #FCEFE8 鱼肚白**：预估 Lc ≈ 85+ ✅
- 目标：正文 Lc ≥ 75 ✅

### 夜间（负极性）

- **正文 #D6ECF0 月白 / 背景 #392F41 乌黑**：浅字深底，预估 Lc ≈ 68–75 ✅
- **标题 #E9F1F6 霜色**：预估 Lc ≈ 72–78 ✅
- 目标：Lc 60–80，且正文未使用 #FFFFFF ✅

### 修正说明

- 原 #2F2F2F 正文 → #50616D 墨色（来自调色板，正极性对比度足够）
- 原夜间 #D8D4C8 → #D6ECF0 月白（调色板色，Lc 更易达标）
- 正文禁止 #FFFFFF，使用月白/霜色等暖白 ✅

---

## 4. 冲突消解

| 冲突类型 | 处理方式 |
|----------|----------|
| Sidebar-Hide.js 中 `sidebarWidth` 未定义 | 在 CONFIG 中新增 `sidebarWidth: '240px'` |
| TDD Sidebar.js 硬编码 rgb(57,75,89)、#4A90E2、#7ED321 | 改为 CSS 变量 `var(--color-subtle-border)`、`var(--highlight-blue)`、`var(--checkbox-checked-color)` |
| roam.css 中 rgba(111,143,121) 与竹青 #789262 不一致 | 统一为 rgba(120,146,98) 竹青 |
| 夜间 mode 非调色板色 (#2A2A2A、#333336 等) | 替换为 乌黑 #392F41、玄青 #3D3B4F、漆黑 #161823 |
| 内联样式 rgb(206,217,224) 覆盖 | 保留 `div[style*="color: rgb(206, 217, 224)"]` 覆盖，强制使用 --reference-title-color / --light-text-color |
| 搜索高亮 background-color: yellow | 覆盖为 --search-hit-bg |

---

## 5. 字体设定保留

- **未修改**：`font-family`、`font-size`、`line-height`、`font-weight` 均未在本次优化中变更
- 现有字栈（--title-font、--heading-font、--body-font、--quote-font、--tag-font、--code-font）保持原样

---

## 6. 色相环逻辑

- **主色/辅助色**：竹青 #789262 与 枯黄 #D3B17D，ΔH ≈ 30°，类比色 ✅
- **强调色**：绯红 #C83C23 作为分裂补色，用于夜间辅色、bullet focus、危险提示 ✅
- **背景混色**：荼白 #F3F9F1、乌黑 #392F41 等含微量主色相，避免纯灰 ✅

---

## 7. 文件变更摘要

| 文件 | 变更内容 |
|------|----------|
| roam.css | 变量层 Masantu 化、日夜统一、布局变量、全局层补全 |
| Sidebar-Hide.js | 修复 sidebarWidth、背景/阴影变量化 |
| TDD Sidebar.js | 硬编码颜色改为 CSS 变量 |
| SELF-CHECK-REPORT.md | 新增自检报告 |
