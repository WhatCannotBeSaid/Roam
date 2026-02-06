---
name: typography
description: Typography & visual system standard for CSS. Use when modifying any CSS—fonts, colors, layout, spacing—or evaluating design consistency. Covers font-family, font-size, color, contrast, hierarchy, alignment, whitespace. Applies to all projects; project-specific skills (e.g. roam-research-visual-system) extend this base.
---

# Typography — 排版与视觉系统标准（全局）

面向所有 CSS 修改的通用评估依据，整合字体、配色、层级、留白与对齐。项目若有专属视觉技能（如 roam-research-visual-system），在其约束范围内以该项目技能为准，其余均以本技能为基。

---

## 设计哲学（上层原则）

- **少即是多**：不随意堆砌字体、颜色或特效；过多强调等于没有重点。
- **协调与风格统一**：视觉好看的重点是「协调」；风格混搭无章会变成大杂烩，宜控制在 1～2 套视觉风格内。
- **层级清晰**：通过**大小、粗细、颜色**区分主次（标题 / 副标 / 正文），而非处处都像重点。
- **慎用特效**：不熟悉的特效（阴影、渐层等）能少用就少用；优先保证清晰与可读。

---

## 一、字体 (Font)

### 1.1 font-family 书写顺序（铁律）

1. **西文字体在前，中文字体在后**  
   浏览器按字符逐项匹配；西文优先西文字体，中文/CJK 用后续字体。
2. **效果佳的在前，效果一般的在后**
3. **末尾必须指定通用字体族**：`serif` / `sans-serif` / `monospace`

```css
/* ✓ */
font-family: 'Palatino', '方正屏显雅宋', serif;

/* ✗ */
font-family: '方正屏显雅宋', 'Palatino';   /* 顺序反；无通用族 */
```

### 1.2 字体名称规范

- 含空格或中文的字体名必须用引号
- 使用系统/字体文件中注册的准确名称；商业字体可写 2～3 个常见变体（如「简 R」「简」）及英文内部名以提高匹配率

### 1.3 缺字、粗体与易读性

| 问题 | 要求 |
|------|------|
| **缺字** | 字体栈须包含覆盖目标语言的 fallback（如 Noto Sans CJK）；上线前检查缺字 |
| **粗体** | 优先选用字体家族自带的粗体字型，避免 `font-weight: bold` 强行加粗 |
| **字号** | 正文最小不低于 `0.875rem`，须考虑移动端可读性 |
| **对比度** | 正文与背景须有足够对比度，避免「颜色太相近」 |

### 1.4 字体角色与变量

建议按**角色**划分字体变量（如 title / heading / body / quote / tag / code / ui），避免 A 角色字体误用于 B 角色；正文区与界面控件区应区分。

---

## 二、配色 (Color)

### 2.1 变量化

- **色值来源**：色值仅来自 https://colors.masantu.com/#/ ；不得替换或重定义既有配色变量/值
- 颜色统一用语义化 CSS 变量定义（如 `--text`、`--bg`、`--primary`）；变量引用须带 fallback
- 亮/暗模式共用变量名，仅在主题类下修改变量值

### 2.2 对比度（APCA 或 WCAG）

| 模式 | 正文 Lc 建议 |
|------|--------------|
| 日间 | Lc ≥ 75（强光环境建议 80） |
| 夜间 | Lc ∈ [60, 80]；禁止纯白文字 |

若不达标，沿相同色相调整明度直至符合阈值。

### 2.3 色相协调

- **主色/辅助色**：类比色（ΔH ≈ 30°）
- **功能/强调色**：分裂补色，保证辨识度
- **中性色**：可注入少量主色饱和度，避免纯灰

### 2.4 交互态

- hover / active / focus 颜色优先用 `oklch()` 从主变量派生（调 L 或 C），避免硬编码新色

---

## 三、排版 (Layout & Type)

### 3.1 层级

- 标题、副标、正文应区隔
- 通过 **大小、粗细、颜色** 营造主次差异

### 3.2 对齐

- 对齐使视觉更整齐、好阅读
- 先排整齐再考虑变化

### 3.3 留白

- 信息与信息之间宜留空间
- 区块边界与文字之间需留白，过挤会降低舒适度

### 3.4 行高

- 正文建议 ≥ 1.5，长文可 1.6～1.75

---

## 四、属性范围（按项目约定）

部分项目（如 Roam）仅允许修改 **color 类 + font-family + font-size**，其余属性交框架或默认样式。编辑前须确认项目约束；若无明确约定，本技能不限制可修改属性。

**Color 类**：`color`、`background` / `background-color`、`border-color`、`fill`、`stroke`  
**Font 类**：`font-family`、`font-size`

---

## 五、工程与性能

- 避免 `!important`；优先通过选择器特异性提升权重
- 避免大量 `filter: blur()` 或复杂多层阴影
- 若有 MutationObserver 等 JS，须避免造成打字/输入延迟

---

## 六、评估检查清单（每次 CSS 改动）

**字体**
- [ ] font-family 顺序：西文 → 中文/CJK → 通用族？
- [ ] 含空格/中文的字体名加了引号？
- [ ] 字体栈含目标语言 fallback？无明显缺字？
- [ ] 需粗体时用字体家族自带字型而非 CSS 加粗？

**配色**
- [ ] 色值来自 colors.masantu.com？
- [ ] 颜色已变量化且引用带 fallback？
- [ ] 正文/背景对比度达标（日间 Lc ≥75，夜间 60–80）？
- [ ] 交互态用 oklch() 从主变量派生？

**排版**
- [ ] 层级清晰（大小/粗细/颜色有主次）？
- [ ] 字号在移动端可读（最小 0.875rem）？
- [ ] 留白与对齐合理？

**一致性**
- [ ] 展示模式与编辑模式已同步（若适用）？
- [ ] 符合项目约定的属性范围？

---

## 参考与扩展

- **APCA 与色相环细则**：[reference.md](reference.md)

**参考来源**：kevin_learn（Threads）— 少即是多、慎用特效、有重点；缺字/乱加粗/易读性；风格统一；对齐/层级/留白。APCA 对比度标准。
