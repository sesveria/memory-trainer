# 🧠 短期记忆训练器 (Memory Trainer)

基于数字广度范式（Digit Span）的极简科学风短期记忆认知训练工具。

> 🎯 **这是什么？** 一款在浏览器中运行的短期记忆训练软件。数字逐个闪现，你需要记住它们并按规则复现——这就是心理学经典的"数字广度"测试。支持正序、倒序、升序三种模式，自适应阶梯难度，所有训练数据保存在本地。

<details>
<summary><b>🔧 技术视角</b></summary>

React 19 + TypeScript + Vite 纯前端 SPA，Zustand 管理训练状态机。无后端、无数据库——所有训练记录通过 localStorage 持久化。引擎层通过 `TrainingEngine` 接口实现插件式设计，便于后续扩展空间广度（Corsi Block）、N-Back 等多模态训练范式。纯 CSS 暗色主题，适配桌面和移动端。

</details>

灵感来自临床认知评估中的 WAIS-IV 数字广度子测试，以自适应阶梯算法动态调整难度。

---

## ✨ 功能

| 功能 | 说明 |
|------|------|
| **正向数字广度** | 记住数字序列，按相同顺序复现 |
| **反向数字广度** | 记住数字序列，然后倒序复现 |
| **升序排序** | 记住数字序列，按数值升序排列后输入 |
| **逐个闪现** | 数字逐个在屏幕中央闪现（800ms/数字），间隔显示注视点 + |
| **自适应难度** | 连续答对 2 次升一级，连续答错 2 次降一级，动态调整 |
| **屏幕数字键盘** | 大按钮 0-9 布局 + 退格 + 确认，适配触屏 |
| **桌面键盘支持** | 直接用物理键盘输入数字，回车提交 |
| **个人最佳记录** | 三种模式分别记录历史最高广度 |
| **训练会话记录** | 每次训练的最终广度、最高广度、正确率、时间戳 |
| **本地数据存储** | localStorage 持久化，无需注册登录 |
| **多模态扩展预留** | `TrainingEngine` 插件接口，后续可加空间记忆、N-Back 等 |

---

## 🎮 训练流程

```
首页 → 选择模式（正序 / 倒序 / 升序）
  ↓
倒计时 3…2…1
  ↓
数字逐个闪现（800ms 显示 → 500ms 注视点 → 下一个）
  ↓
输入回忆 — 屏幕键盘或物理键盘输入数字序列
  ↓
反馈 ✓ / ✗ → 自适应调整广度
  ↓
继续下一轮 或 结束训练
  ↓
会话摘要：最终广度 · 最高广度 · 正确率
  ↓
返回首页（记录已保存）
```

### 自适应阶梯规则

| 连续表现 | 广度变化 | 说明 |
|---------|---------|------|
| ✓✓ | +1 | 连续正确 2 次，能力上升 |
| ✗✗ | −1 | 连续错误 2 次，回调验证 |
| ✓✗ 或 ✗✓ | 不变 | 一正一错，维持当前难度 |

- 正序/倒序起始广度：3，天花板：9
- 升序排序起始广度：2，天花板：8
- 每试次的数字不重复（0–9 随机抽取）

### 升序排序示例

```
闪现序列：5 · 2 · 8 · 1
正确输入：1 → 2 → 5 → 8   （按数值升序排列）
错误输入：5 → 2 → 8 → 1   （直接复现，未排序）
```

---

## 🏗 项目结构

```
memory-trainer/
├── index.html                # 入口 HTML
├── package.json              # 依赖 & 脚本
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
└── src/
    ├── main.tsx              # React 挂载入口
    ├── App.tsx               # 根组件（首页 / 训练页 路由）
    ├── index.css             # 全局暗色主题样式
    ├── types/
    │   └── index.ts          # 训练模式、会话、引擎接口等类型
    ├── engine/
    │   ├── digitSpan.ts      # 三种模式：序列生成 + 验证逻辑
    │   ├── adaptive.ts       # 自适应阶梯算法
    │   └── storage.ts        # localStorage 读写 & 个人最佳维护
    ├── store/
    │   └── trainingStore.ts  # Zustand 状态机（阶段流转 + 试次管理）
    ├── pages/
    │   ├── HomePage.tsx       # 首页：模式选择 + 最佳记录 + 最近训练
    │   └── TrainingPage.tsx   # 训练页：外壳布局 + 阶段分发器 + 闪现控制
    └── components/
        ├── ModeSelector.tsx  # 模式选择卡片（正序/倒序/升序）
        ├── PersonalBests.tsx # 个人最佳记录栏
        ├── Instructions.tsx  # 倒计时提示区
        ├── DigitDisplay.tsx  # 大数字闪现组件
        ├── FixationCross.tsx # 注视点 "+" 组件
        ├── ResponseDisplay.tsx # 已输入数字回显
        ├── Numpad.tsx        # 屏幕数字键盘 + 物理键盘事件
        ├── Feedback.tsx      # ✓/✗ 反馈弹层
        └── SessionSummary.tsx # 会话结束摘要 & 保存
```

---

## 🛠 开发命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器（:5174） |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览生产构建 |

```bash
# 开发
npm run dev
# 打开 http://localhost:5174
```

---

## 📦 部署

纯静态 SPA，构建后将 `dist/` 部署到任意静态托管即可：

```bash
npm run build
# dist/ 目录可直接部署到 Nginx / Vercel / Netlify / GitHub Pages 等
```

---

## 🔮 后续扩展方向

`engine/types.ts` 中定义了 `TrainingEngine` 接口，新增训练范式只需：

```
src/engine/
├── types.ts          ← TrainingEngine 接口
├── digitSpan.ts      ← 已完成
├── corsiBlock.ts     ← 计划：空间广度（位置序列记忆）
├── nBack.ts          ← 计划：N-Back 双任务
└── patternSpan.ts    ← 计划：图案矩阵回忆
```

---

## 📄 许可

MIT
