# BrowserScan.org — 赛博工业设计系统

_版本：2025-11-27_

## 1. 设计原则
1. **Precision**：所有数据呈现遵循等宽排版、明确单位、界限清晰。
2. **Stealth**：深色工业背景、微弱噪点、极简色彩，仿终端/军规 UI。
3. **High Data Density**：Bento Grid 凝聚大量信息，卡片紧凑但层次分明。
4. **Trust via Ritual**：扫描动画、渐进展示营造严谨流程，增加可信度。

## 2. 色彩体系
| Token | 变量 | 用途 |
| --- | --- | --- |
| `--bg-primary` | `#09090b` (Zinc-950) | 全局背景，附带噪点纹理 | 
| `--bg-card` | `#0f0f13` | 卡片背景，1px `border-zinc-800` |
| `--text-main` | `#f4f4f5` (Zinc-100) | 数据、标题 |
| `--text-muted` | `#a1a1aa` (Zinc-400) | Label、注释 |
| `--accent-safe` | `#10b981` (Emerald-500) | 安全、PASS |
| `--accent-risk` | `#f43f5e` (Rose-500) | 高风险、FAIL |
| `--accent-warn` | `#f59e0b` (Amber-500) | 警告 |
| `--accent-info` | `#0ea5e9` (Sky-500) | 中立信息、链接 |
| `--glow-safe` | `rgba(16,185,129,0.35)` | Health Ring 光晕 |

状态色映射 (Health Ring)：
- 0-49 → `--accent-risk`
- 50-79 → `--accent-warn`
- 80-100 → `--accent-safe`

## 3. 字体体系
- **Sans**：`Geist Sans` (fallback: Inter) — 标题、正文、按钮。
- **Mono**：`Geist Mono` (fallback: JetBrains Mono) — IP、Hash、UA、代码。
- 字重：
  - Display: 600
  - Body: 400
  - Mono values: 500
- Letter spacing：Label 使用 `tracking-[0.2em]`，全部 Uppercase。

## 4. 布局规范
- 外层容器 `max-w-7xl mx-auto px-4 md:px-6 lg:px-0`。
- Grid：`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4`。
- 卡片尺寸：
  - Hero `col-span-1 md:col-span-2 row-span-2`
  - Major `col-span-1 md:col-span-2`
  - Minor `col-span-1`
- 卡片样式：`rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950/80 to-zinc-900/60 backdrop-blur-sm`。
- Spotlight Hover：`relative` + `before:absolute before:inset-0 before:bg-gradient-radial before:opacity-0 hover:before:opacity-40 before:transition`。

## 5. 核心组件
### 5.1 Health Ring
- SVG 圆环 + `stroke-dasharray` 动画。
- 外圈 2px 描边，内圈 Glow (`drop-shadow(0 0 12px var(--glow-safe))`)。
- 中心显示 score + grade + verdict。
- 入场动画：`stroke-dashoffset` 从全长到 `value`，耗时 1.2s，延迟 300ms。

### 5.2 KeyValueCard
```
<div className="space-y-1">
  <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">IP ADDRESS</span>
  <div className="flex items-center gap-2">
    <code className="text-lg font-mono text-zinc-100 truncate">64.32.13.210</code>
    <CopyButton variant="ghost" size="icon" aria-label="Copy IP" />
  </div>
</div>
```
- 可选 `blur-sm` + `hover:blur-0`，保护隐私截图。

### 5.3 StatusDot
- Base：`h-2 w-2 rounded-full`。
- 状态：
  - Safe: `bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse`
  - Leak: `bg-rose-500 animate-ping` + parent `relative` 添加静态点。
  - Warn: `bg-amber-500 animate-pulse-slow`

### 5.4 Scan Console
- 模拟终端：`font-mono text-xs text-emerald-400 bg-black/60 rounded-xl p-4 h-32 overflow-hidden`。
- 每 150ms update：`[1.2s] Analyzing TLS Fingerprint...` 等信息。
- 完成显示 `✅ Scan Complete`。

### 5.5 JsonCodeBlock
- 背景 `bg-zinc-950 border border-zinc-900 rounded-xl`。
- 行号列：`text-zinc-600 text-xs pr-4`。
- 语法高亮：prismjs 暗色主题 + 自定义变量色。

## 6. 动效 & 微交互
- 所有按钮 `transition-all duration-200`。
- 卡片 hover 轻微上浮 `translate-y-[-2px]`。
- Loading skeleton: `bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-[shimmer_2s_infinite]`。
- 入口动画 `prefers-reduced-motion` 关闭。

## 7. 无障碍
- 色彩对比 ≥ WCAG AA (4.5:1)。
- 所有图标按钮提供 `aria-label`。
- `StatusDot` 添加 `role="status" aria-live="polite"`。
- 优先键盘导航：Focus ring 使用 `outline outline-2 outline-emerald-500/70`。

## 8. 资产管理
- Logo：简化矩形 + scan wave；SVG 存 `apps/web/public/branding/`。
- 噪点纹理：静态 PNG/AVIF 贴图，CSS `background-image`。
- Map：使用 Mapbox Dark style + custom marker glow。

## 9. 组件库整合
- Shadcn UI 作为基础，按需导入卡片、按钮、Dialog、Tabs。
- 在 `packages/ui` 扩展：`Card`, `SpotlightCard`, `StatusIndicator`, `HealthRing`。
- Props 约定：所有组件支持 `className` 透传 + `tone` (safe/warn/risk/info)。

## 10. 文案语气
- 标题简练：`Identity Snapshot`, `Risk Board`, `Consistency Matrix`。
- 说明性文本：第三人称、专业口吻，如 “Detected WebRTC leak exposing 182.150.247.57 (CN)”。
- PDF 用正式语气：“This report certifies...”。

