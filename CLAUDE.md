# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role

你是一名精通 Web 前端开发的高级工程师，拥有丰富的 React、浏览器端 AI 推理、WebGPU 技术经验。这是一个单文件 React 项目，所有代码（HTML、CSS、JSX）都必须写在 `webGPU.html` 文件中。

## 重要：单文件项目

**禁止的行为：**
- 创建单独的 CSS 文件
- 创建单独的 JS/TS 文件
- 创建单独的组件文件
- 任何形式的文件拆分

**允许的行为：**
- 在 webGPU.html 内部使用组件化编码模式
- 定义独立的组件函数/常量
- 使用 Tailwind CSS 类名或内联 `<style>` 标签

## 技术架构

- **React 18** (CDN) - UI 框架
- **Tailwind CSS** (CDN) - 样式框架
- **WebLLM @mlc-ai/web-llm@0.2.79** - 基于 WebGPU 的浏览器端 LLM 推理
- **Babel Standalone** - 浏览器内 JSX 编译
- **Lucide Icons** - 图标库
- **IndexedDB** - 模型缓存

## 编码规范

### 文件命名

单文件项目，无需额外文件。

### 组件化编码

在 webGPU.html 内部采用组件化模式：

```jsx
// 图标组件封装
const IconWrapper = ({ name, size = 24, className = "" }) => { ... };
const BotIcon = (p) => <IconWrapper name="Bot" size={20} {...p} />;

// 数据常量
const MODEL_LIST = [...];
const ROLE_LIST = [...];

// 主应用组件
function App() { ... }
```

## 核心状态

| 状态变量 | 用途 |
|---------|------|
| `engine` | MLC LLM 引擎实例 |
| `messages` | 对话历史数组 |
| `modelId`/`modelName` | 选中模型信息 |
| `roleId` | AI 角色选择 |
| `isGenerating` | 流式响应状态 |
| `cachedModels` | IndexedDB 缓存状态 |

## 核心函数

| 函数 | 行号 | 用途 |
|-----|------|------|
| `loadModel(modelId)` | 197 | 初始化 WebLLM 引擎，带进度回调 |
| `sendMessage()` | 272 | 发送消息，流式获取响应 |
| `abortGeneration()` | 345 | 中断生成 |
| `getCachedModels()` | 152 | 查询 IndexedDB 缓存的模型 |
| `handleModelChange()` | 365 | 模型选择变更处理 |

## 数据持久化

- **localStorage** - 记住上次选择的模型（key: `webllm_last_model`）
- **IndexedDB** - 缓存下载的模型（database: `webllm-cache`，store: `model-cache`）

## 关键编码模式

1. **动态 ES 模块加载** - 使用 `import()` 动态加载 WebLLM
2. **流式响应** - 使用 `AbortController` 支持中断生成
3. **IndexedDB 封装** - 自定义缓存查询逻辑
