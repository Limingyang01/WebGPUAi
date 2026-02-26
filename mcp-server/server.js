import express from 'express';
import { createServer } from 'http';

const app = express();
app.use(express.json());

// CORS 支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// MCP JSON-RPC 端点
app.post('/', async (req, res) => {
  const { jsonrpc, id, method, params } = req.body;

  try {
    let result;

    switch (method) {
      case 'tools/list':
        result = {
          tools: [
            {
              name: 'web_search',
              description: '搜索互联网获取信息，返回搜索结果摘要',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: '搜索关键词' },
                },
                required: ['query'],
              },
            },
            {
              name: 'get_weather',
              description: '获取指定城市的天气信息',
              inputSchema: {
                type: 'object',
                properties: {
                  city: { type: 'string', description: '城市名称，如：长沙、上海' },
                },
                required: ['city'],
              },
            },
            {
              name: 'get_time',
              description: '获取当前时间信息',
              inputSchema: {
                type: 'object',
                properties: {
                  timezone: { type: 'string', description: '时区，如：Asia/Shanghai', default: 'Asia/Shanghai' },
                },
              },
            },
          ],
        };
        break;

      case 'tools/call':
        const { name, arguments: args } = params;
        let content;

        switch (name) {
          case 'web_search': {
            try {
              const query = encodeURIComponent(args.query);
              // 使用百度搜索（国内可访问）
              const response = await fetch(`https://www.baidu.com/s?wd=${query}&rn=5`, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              });
              const html = await response.text();

              // 解析百度搜索结果
              const results = [];
              const titleRegex = /<h3 class="c-title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/g;
              const abstractRegex = /<span class="c-abstract[^"]*"[^>]*>([^<]+)<\/span>/g;

              let titleMatch, abstractMatch;
              let count = 0;

              while ((titleMatch = titleRegex.exec(html)) !== null && count < 5) {
                results.push({
                  title: titleMatch[1].replace(/<[^>]+>/g, '').trim(),
                  snippet: ''
                });
                count++;
              }

              count = 0;
              while ((abstractMatch = abstractRegex.exec(html)) !== null && count < results.length) {
                if (results[count]) {
                  results[count].snippet = abstractMatch[1].replace(/<[^>]+>/g, '').trim();
                }
                count++;
              }

              if (results.length === 0) {
                content = `未找到 "${args.query}" 的搜索结果`;
              } else {
                content = `搜索结果: ${args.query}\n\n` +
                  results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet || '无摘要'}`).join('\n\n');
              }
            } catch (e) {
              content = `搜索失败: ${e.message}`;
            }
            break;
          }

          case 'get_weather': {
            try {
              let city = args.city || '北京';

              // 城市名称映射到城市代码
              const cityCodeMap = {
                '北京': '101010100',
                '上海': '101020100',
                '广州': '101280101',
                '深圳': '101280601',
                '杭州': '101210101',
                '成都': '101270101',
                '武汉': '101200101',
                '西安': '101110101',
                '南京': '101190101',
                '重庆': '101040100',
                '天津': '101030100',
                '苏州': '101190401',
                '长沙': '101250101',
                '郑州': '101180101',
                '济南': '101120101',
                '青岛': '101120201',
                '沈阳': '101070101',
                '哈尔滨': '101050101',
                '长春': '101060101',
                '福州': '101230101',
                '南昌': '101240101',
                '合肥': '101220101',
                '昆明': '101290101',
                '兰州': '101160101',
              };

              const cityCode = cityCodeMap[city];

              // 使用中国天气网 API
              const response = await fetch(`https://www.weather.com.cn/data/sk/${cityCode}.html`);
              const data = await response.json();

              if (data.weatherinfo) {
                const w = data.weatherinfo;
                content = `${city} 今日天气:\n` +
                  `- 当前温度: ${w.temp}°C\n` +
                  `- 风向: ${w.WD || '未知'}\n` +
                  `- 风速: ${w.WS || '未知'}\n` +
                  `- 湿度: ${w.SD || '未知'}\n` +
                  `- 天气状况: ${w.weather || '未知'}\n` +
                  `- 更新时间: ${w.time}`;
              } else {
                content = `无法获取 ${city} 的天气信息`;
              }
            } catch (e) {
              content = `天气查询暂时不可用: ${e.message}。请稍后重试。`;
            }
            break;
          }

          case 'get_time': {
            const timezone = args.timezone || 'Asia/Shanghai';
            const now = new Date().toLocaleString('zh-CN', {
              timeZone: timezone,
              timeZoneName: 'long',
            });
            content = `当前时间 (${timezone}):\n${now}`;
            break;
          }

          default:
            throw new Error(`未知工具: ${name}`);
        }

        result = { content: [{ type: 'text', text: content }] };
        break;

      default:
        throw new Error(`未知方法: ${method}`);
    }

    res.json({ jsonrpc: '2.0', id, result });
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: error.message },
    });
  }
});

// 启动 HTTP 服务器
const PORT = 3000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`MCP HTTP 服务器已启动: http://localhost:${PORT}`);
  console.log('可用工具: web_search, get_weather, get_time');
});
