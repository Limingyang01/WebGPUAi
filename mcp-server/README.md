# Pudding MCP 服务器

本地 MCP 服务器，提供搜索和天气功能。

## 安装

```bash
cd mcp-server
npm install
```

## 启动

```bash
npm start
```

启动后会显示 `MCP 服务器已启动...`

## 在 Web 应用中使用

1. 点击侧边栏的 Plug 图标
2. 输入服务器地址：
   ```
   http://localhost:3000
   ```
3. 点击"测试连接"

## 可用工具

| 工具名 | 功能 | 示例 |
|--------|------|------|
| web_search | 搜索互联网 | query: "今天新闻" |
| get_weather | 查询天气 | city: "北京" |
| get_time | 获取时间 | timezone: "Asia/Shanghai" |

## 测试 MCP

启动服务器后，可以用 curl 测试：

```bash
# 测试连接
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# 调用搜索工具
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"web_search","arguments":{"query":"天气"}}}'
```
