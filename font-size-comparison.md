# 字号对比：当前主题 vs Lesswrong（RoamStudio）

基于 **roam.css** 中你的变量定义，与 **RoamStudio Lesswrong 主题**（lesswrong-auto.css）中可对应的 system 变量对比。  
Lesswrong 使用与 system.css 相同的变量名（`--fs-main__*`），你当前使用简写名（`--fs-*`）并在 roam.css 里映射到具体元素。

---

## 正文与标题字号对比

| 用途 | 你的变量 (roam.css) | 你的取值 | Lesswrong 对应变量 | Lesswrong 取值 | 备注 |
|------|---------------------|----------|--------------------|----------------|------|
| **页面标题** | `--fs-page-title` | **2.5rem** | `--fs-main__page-title` | 未在 lesswrong-auto.css 中显式定义（继承） | 你更大 |
| **H1 / 一级标题** | `--fs-h1` | **1.875rem** | `--fs-main__level1` | **2.3rem** | Lesswrong 更大 |
| **H2 / 二级标题** | `--fs-h2` | **1.5rem** | `--fs-main__level2` | 未显式定义（继承） | — |
| **H3 / 三级标题** | `--fs-h3` | **1.25rem** | `--fs-main__level3` | 未显式定义（继承） | — |
| **正文** | `--fs-body` | **1rem** | `--fs-main`（正文块） | 未显式定义（通常为 1rem） | 一致 |
| **引用块** | `--fs-quote` | **1.28rem** | `--fs-main__quote` | 未显式定义（继承） | 你略大 |
| **标签 Tag** | `--fs-tag` | **0.875rem** | `--fs-main__tags` | 未显式定义（继承） | — |

---

## 换算参考（假设根字号 16px）

| 用途 | 你的取值 | 约等于 (px) | Lesswrong level1 | 约等于 (px) |
|------|----------|--------------|------------------|-------------|
| 页面标题 | 2.5rem | 40px | — | — |
| H1 | 1.875rem | 30px | 2.3rem | 36.8px |
| H2 | 1.5rem | 24px | — | — |
| H3 | 1.25rem | 20px | — | — |
| 正文 | 1rem | 16px | 1rem | 16px |
| 引用 | 1.28rem | 20.48px | — | — |
| 标签 | 0.875rem | 14px | — | — |

---

## 小结

- **页面标题**：你 2.5rem，Lesswrong 未覆盖，一般会小于或等于你的设置。
- **H1**：你 1.875rem（约 30px），Lesswrong **2.3rem**（约 37px），Lesswrong 明显更大。
- **H2 / H3 / 正文 / 引用 / 标签**：Lesswrong 在 lesswrong-auto.css 里未给出对应 `--fs-main__*` 数值，实际效果为 Roam/浏览器或 theme 默认（正文多为 1rem）。
- 若想「更接近 Lesswrong」：可把 `--fs-h1` 提高到 **2.3rem**；若想保持当前层级，可维持 1.875rem。

数据来源：roam.css（约 324–331 行）、system.css 对 `--fs-main__*` 的引用、RoamStudio 仓库 lesswrong-auto.css（仅 level1 确认 2.3rem，其余为未显式定义）。
