# Pudding 离线 AI 助手

基于 WebGPU 的浏览器端 LLM 推理应用，支持知识库增强（RAG）和 MCP 外部工具接入。

## 功能特性

- **本地 LLM 推理** - 无需 GPU 服务器，基于 WebGPU 在浏览器中运行大模型
- **知识库 RAG** - 上传文档构建本地知识库，支持语义检索
- **MCP 工具** - 接入外部服务（搜索、天气等）
- **多模型支持** - 支持 Qwen2.5、Phi-3.5 等多种模型
- **主题切换** - 支持明暗主题
- **历史记录** - 自动保存对话历史

## 环境要求

- Chrome 113+ 或 Edge 113+（需支持 WebGPU）
- 4GB+ 显存（推荐 6GB）

## 快速开始

### 1. 启动主应用

直接用浏览器打开 `webGPU.html`

### 2. 选择模型

首次使用需要选择并加载模型：
- 低显存：Qwen2.5-0.5B（推荐）
- 高显存：Qwen2.5-3B、Qwen3-4B

### 3. 开始对话

直接输入消息即可对话。

## 知识库功能

1. 点击侧边栏的图书图标创建知识库
2. 上传 TXT 或 MD 格式的文档
3. 启用知识库开关，AI 将基于知识库内容回答

## MCP 功能（可选）

### 本地 MCP 服务器

如需使用搜索、天气等在线功能：

```bash
# 1. 进入 MCP 服务目录
cd mcp-server

# 2. 安装依赖
npm install

# 3. 启动服务（开发模式，代码修改自动重启）
npm run dev

# 或生产模式
npm start
```

然后在应用中：
1. 点击侧边栏 Plug 图标
2. 输入服务器地址：`http://localhost:3000`
3. 点击"测试连接"，成功后点击"添加"
4. 点击"连接"按钮

**可用工具：**
- `web_search` - 搜索互联网
- `get_weather` - 查询天气
- `get_time` - 获取时间

### MCP 关键词

发送消息时包含以下关键词会自动调用 MCP：
- 搜索、查找、最新、天气、新闻
- search、weather、news

## 项目结构

```
WebGPUAi/
├── webGPU.html      # 主应用（单文件 React）
├── mcp-server/      # MCP 服务器（可选）
│   ├── server.js    # 服务端代码
│   └── package.json
├── PROJECT.md       # 项目详细文档
└── README.md        # 本文件
```

## 技术栈

- React 18 + Tailwind CSS
- WebLLM (MLC AI) - 浏览器端 LLM
- Transformers.js - 语义向量
- IndexedDB - 本地存储

## 注意事项

- 模型首次加载需要下载（约 1-4GB）
- 建议使用 Chrome 以获得最佳 WebGPU 支持
- 本地 MCP 服务器需要 Node.js 18+
