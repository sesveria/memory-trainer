# 🧠 短期记忆训练器 (Memory Trainer)

一款在浏览器中运行的极简科学风短期记忆认知训练工具，涵盖数字广度、空间广度、图案矩阵回忆和 N-Back 双任务共 11 种训练模式。

🌐 **在线体验**: [sesveria.github.io/memory-trainer](https://sesveria.github.io/memory-trainer/)

<details>
<summary><b>🔧 技术视角</b></summary>

React 19 + TypeScript + Vite 纯前端 SPA，Zustand 管理训练状态机。无后端、无数据库——所有训练记录通过 localStorage 持久化。引擎层通过 `TrainingEngine` 接口 + `registry` 注册中心实现插件式设计，新增训练范式只需写一个 engine 文件并自注册。纯 CSS 暗色主题，适配桌面和移动端。

</details>

灵感来自临床认知评估中的 WAIS-IV 数字广度子测试以及 Corsi Block、Dual N-Back 等经典认知训练范式，以自适应阶梯算法动态调整难度。

---

## ✨ 训练模式

### 数字广度（3 种）

| 模式 | 规则 | 操作说明 |
|------|------|---------|
| **正向数字广度** | 记住数字序列，按相同顺序复现 | 每个数字闪现 800ms → 注视点 `+` 间隔 → 所有数字展示完后，用屏幕数字键盘或物理键盘输入 → 回车或点击确认 |
| **反向数字广度** | 记住数字序列，倒序复现 | 同上，但输入时需从最后一个数字开始倒过来输入。例如看到 `5 → 2 → 8`，应输入 `8 → 2 → 5` |
| **升序排序** | 记住数字序列，按数值升序排列后输入 | 看到数字后，将所有数字从小到大排序后输入。例如看到 `5 → 2 → 8 → 1`，应输入 `1 → 2 → 5 → 8` |

- ✦ 起始广度：3（升序 2），天花板：9（升序 8）
- ✦ 数字范围：0–9，同一试次不重复
- ✦ 输入方式：屏幕 0-9 数字键盘 + 退格 + 确认按钮，桌面端支持物理键盘

### 视觉空间 — Corsi Block（2 种）

| 模式 | 规则 | 操作说明 |
|------|------|---------|
| **空间广度（正序）** | 4×4 网格中方块逐个蓝色闪烁，记住位置顺序并点击复现 | 关注网格中闪烁的位置 → 闪烁完后点击方块，每次点一个 → 满额自动提交 |
| **空间广度（倒序）** | 同上，倒序点击复现 | 闪烁顺序和点击顺序相反 |

- ✦ 起始广度：3，天花板：9
- ✦ 已选方块显示绿色 + 序号，不可重复点击
- ✦ 满额自动提交，也可中途结束训练

### 图案矩阵回忆（3 种）

| 模式 | 规则 | 操作说明 |
|------|------|---------|
| **图案矩阵 3×3** | 3×3 网格中同时亮起若干蓝色方块，记住位置后在熄灭的网格上还原 | 展示 2 秒 → 网格全部变暗 → 点击你认为亮过的位置（可取消重选） → 点击「确认提交」 |
| **图案矩阵 4×4** | 同上，4×4 网格 | 亮点上限 7（< 总格数一半），策略始终是"记住亮的" |
| **图案矩阵 5×5** | 同上，5×5 网格 | 亮点上限 12，格子更密集，难度更高 |

- ✦ 起始亮点数：2，上限随阶数变化（3×3=4, 4×4=7, 5×5=12）
- ✦ 选中的格子显示绿色 ✓，可点击取消
- ✦ "清除重选"按钮可一键清空重来
- ✦ 选中的集合必须与原始集合完全相同（顺序无关）才算正确

### N-Back 双任务（3 种）

| 模式 | 规则 | 操作说明 |
|------|------|---------|
| **1-Back 双任务** | 判断当前位置和字母是否与 **1 步前**相同 | 每 2.5 秒一轮（500ms 蓝色位置高亮 + 字母，之后定格） → 位置相同按 `A`（或点击"位置匹配"） → 字母相同按 `L`（或点击"字母匹配"） → 两个判断独立进行 → 20 轮后自动结束 |
| **2-Back 双任务** | 同上，与 **2 步前**比较 | 需记住前两轮的状态 |
| **3-Back 双任务** | 同上，与 **3 步前**比较 | 难度最高，工作记忆负荷最大 |

- ✦ 固定 20 轮，位置和字母各有 25% 概率匹配
- ✦ 键盘快捷键：`A` = 位置匹配，`L` = 字母匹配
- ✦ 触屏可用底部两个按钮（蓝色=位置，绿色=字母）
- ✦ 按钮按下后高亮驻留，下一轮自动重置
- ✦ 训练结束显示位置正确率、字母正确率、双任务正确率

---

## 🎮 通用训练流程

```
首页 → 选择训练模式（共 11 种，按类别分组）
  ↓
倒计时 3…2…1
  ↓
刺激呈现阶段（数字闪现 / 位置闪烁 / 字母 + 位置 / 图案展示）
  ↓
回忆 / 判断阶段（输入数字 / 点击位置 / 按键匹配）
  ↓
反馈 ✓ / ✗ → 自适应调整难度
  ↓
继续下一轮 或 结束训练
  ↓
会话摘要：最终广度 · 最高广度 · 正确率
  ↓
返回首页（记录已保存，统计面板自动更新）
```

### 自适应阶梯规则（数字 / 空间 / 图案模式）

| 连续表现 | 广度变化 | 说明 |
|---------|---------|------|
| ✓✓ | +1 | 连续正确 2 次，能力上升 |
| ✗✗ | −1 | 连续错误 2 次，回调验证 |
| ✓✗ 或 ✗✓ | 不变 | 一正一错，维持当前难度 |

> N-Back 模式固定 20 轮 / 固定 N 值，不采用自适应阶梯。用户可手动选择 1/2/3-Back。

---

## 📊 统计面板

首页提供三块实时数据可视化（≥2 条训练记录时显示）：

| 面板 | 内容 |
|------|------|
| **概览卡片** | 累计训练次数、总试次、平均正确率、近 7 天活跃天数 |
| **广度趋势折线图** | 最近 20 次训练的 bestSpan 变化曲线 |
| **类别柱状图** | 数字广度 / 视觉空间 / 图案记忆 / N-Back 四个类别的平均正确率对比 |

所有图表为内联 SVG，零外部依赖。

---

## 🏗 项目结构

```
memory-trainer/
├── index.html
├── package.json
├── vite.config.ts                # base: './' 适配 GitHub Pages
├── tsconfig.json
├── .github/workflows/deploy.yml  # push main → auto deploy to gh-pages
└── src/
    ├── main.tsx                  # 入口 + side-effect 导入自动注册引擎
    ├── App.tsx
    ├── index.css                 # 暗色主题
    ├── types/index.ts            # ModeId, Metadata, Session, Engine 类型
    ├── engine/
    │   ├── registry.ts           # 模式注册中心
    │   ├── digitSpan.ts          # 数字广度（正序/倒序/升序）
    │   ├── corsiBlock.ts         # 空间广度（正序/倒序）
    │   ├── patternMatrix.ts      # 图案矩阵（3×3/4×4/5×5）
    │   ├── nBack.ts              # N-Back 双任务（1/2/3-Back）
    │   ├── adaptive.ts           # 自适应阶梯算法
    │   └── storage.ts            # localStorage 读写 + 数据迁移
    ├── store/trainingStore.ts    # Zustand 状态机
    ├── pages/
    │   ├── HomePage.tsx
    │   └── TrainingPage.tsx       # 按 category 分发渲染
    └── components/
        ├── ModeSelector.tsx      # 按类别分组的模式选择卡片
        ├── PersonalBests.tsx
        ├── StatsPanel.tsx        # 统计面板（卡片 + 趋势图 + 柱状图）
        ├── Instructions.tsx
        ├── DigitDisplay.tsx
        ├── FixationCross.tsx
        ├── DigitRecallingArea.tsx
        ├── Numpad.tsx
        ├── ResponseDisplay.tsx
        ├── Feedback.tsx
        ├── SessionSummary.tsx
        ├── CorsiGrid.tsx
        ├── CorsiPresentingCanvas.tsx
        ├── CorsiRecallingArea.tsx
        ├── PatternGrid.tsx
        ├── PatternPresentingCanvas.tsx
        ├── PatternRecallingArea.tsx
        ├── NbackPresentingCanvas.tsx
        └── NbackSummary.tsx
```

---

## 🛠 开发命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器（:5174） |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览生产构建 |

---

## 📦 部署

### GitHub Pages（自动）

push 到 `main` 分支后，GitHub Actions 自动构建并部署。首次使用需确保：

1. Settings → Actions → General → Workflow permissions 勾选 **"Read and write permissions"**
2. Settings → Pages → Source 选择 **"Deploy from a branch"**，分支选 `gh-pages`，目录 `/ (root)`

> ⚠️ `vite.config.ts` 中必须设置 `base: './'`，否则 GitHub Pages 子路径下静态资源会加载失败。

### 手动

```bash
npm run build
# dist/ → Nginx / Vercel / Netlify 等
# 或 git subtree push --prefix dist origin gh-pages
```

---

## 📄 许可

MIT
