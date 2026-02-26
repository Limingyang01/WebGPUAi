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
                content = `未找到 "${args.query}" 的搜索结果，建议尝试其他关键词`;
              } else {
                content = `🔍 搜索关键词: "${args.query}"\n` +
                  `📊 共找到 ${results.length} 条相关结果:\n\n` +
                  results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet || '无摘要'}`).join('\n\n') +
                  `\n\n💡 以上信息来自互联网，仅供参考`;
              }
            } catch (e) {
              content = `搜索失败: ${e.message}`;
            }
            break;
          }

          case 'get_weather': {
            try {
              let city = args.city || '北京';

              // 中文城市名到坐标的映射
              const cityCoords = {
                '北京': { lat: 39.9042, lon: 116.4074 },
                '上海': { lat: 31.2304, lon: 121.4737 },
                '广州': { lat: 23.1291, lon: 113.2644 },
                '深圳': { lat: 22.5431, lon: 114.0579 },
                '杭州': { lat: 30.2741, lon: 120.1551 },
                '成都': { lat: 30.5728, lon: 104.0668 },
                '武汉': { lat: 30.5928, lon: 114.3055 },
                '西安': { lat: 34.3416, lon: 108.9398 },
                '南京': { lat: 32.0603, lon: 118.7969 },
                '重庆': { lat: 29.4316, lon: 106.9123 },
                '天津': { lat: 39.3434, lon: 117.3616 },
                '苏州': { lat: 31.2989, lon: 120.5853 },
                '长沙': { lat: 28.2282, lon: 112.9388 },
                '郑州': { lat: 34.7466, lon: 113.6253 },
                '济南': { lat: 36.6512, lon: 117.1205 },
                '青岛': { lat: 36.0671, lon: 120.3826 },
                '沈阳': { lat: 41.8057, lon: 123.4328 },
                '哈尔滨': { lat: 45.8038, lon: 126.534 },
                '长春': { lat: 43.8171, lon: 125.3235 },
                '福州': { lat: 26.0745, lon: 119.2965 },
                '南昌': { lat: 28.6829, lon: 115.8579 },
                '合肥': { lat: 31.8206, lon: 117.2272 },
                '昆明': { lat: 25.0406, lon: 102.7129 },
                '兰州': { lat: 36.0611, lon: 103.8343 },
              };

              const coords = cityCoords[city];
              if (!coords) {
                content = `暂不支持查询 ${city} 的天气（仅支持：北京、上海、广州、深圳、杭州、成都、武汉、西安、南京、重庆、天津、苏州、长沙、郑州、济南、青岛、沈阳、哈尔滨、长春、福州、南昌、合肥、昆明、兰州）`;
                break;
              }

              // 使用 Open-Meteo API (免费无需 API key)
              const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index&timezone=auto`;
              const response = await fetch(weatherUrl);
              const data = await response.json();

              if (data.current) {
                const w = data.current;
                // 天气代码映射
                const weatherCodes = {
                  0: '晴', 1: '晴间多云', 2: '多云', 3: '阴',
                  45: '雾', 48: '雾凇',
                  51: '小毛毛雨', 53: '中毛毛雨', 55: '大毛毛雨',
                  61: '小雨', 63: '中雨', 65: '大雨',
                  71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
                  80: '阵雨', 81: '中阵雨', 82: '大阵雨',
                  85: '小阵雪', 86: '大阵雪',
                  95: '雷暴', 96: '雷暴+小冰雹', 99: '雷暴+大冰雹',
                };
                const weatherDesc = weatherCodes[w.weather_code] || '未知';
                const temp = parseFloat(w.temperature_2m);
                const humidity = parseInt(w.relative_humidity_2m);
                const uvIndex = parseFloat(w.uv_index) || 0;
                const windSpeed = parseFloat(w.wind_speed_10m);

                // 生成建议
                const suggestions = [];

                // 穿衣建议
                if (temp < 0) {
                  suggestions.push('天气寒冷，建议穿羽绒服、棉服等保暖外套');
                } else if (temp < 10) {
                  suggestions.push('天气较冷，建议穿大衣、薄羽绒服或夹克');
                } else if (temp < 18) {
                  suggestions.push('天气凉爽，建议穿长袖、薄外套或针织衫');
                } else if (temp < 25) {
                  suggestions.push('天气舒适，建议穿长袖或薄款衣服');
                } else {
                  suggestions.push('天气炎热，建议穿短袖、短裤等轻薄衣物，注意防暑');
                }

                // 湿度建议
                if (humidity > 80) {
                  suggestions.push('湿度较高，注意防潮，电器设备注意防潮');
                } else if (humidity < 30) {
                  suggestions.push('空气干燥，注意补水，适当使用加湿器');
                }

                // 紫外线建议
                if (uvIndex >= 8) {
                  suggestions.push('紫外线强度很高，外出务必做好防晒措施，涂抹高倍防晒霜，佩戴遮阳帽和太阳镜');
                } else if (uvIndex >= 5) {
                  suggestions.push('紫外线较强，建议涂抹防晒霜，避免长时间日晒');
                } else if (uvIndex >= 2) {
                  suggestions.push('紫外线中等，可以适当防晒');
                }

                // 天气状况建议
                if ([61, 63, 65, 80, 81, 82].includes(w.weather_code)) {
                  suggestions.push('有降水可能，建议携带雨伞或雨衣');
                }
                if ([71, 73, 75, 77, 85, 86].includes(w.weather_code)) {
                  suggestions.push('有降雪，建议穿防滑鞋，注意交通安全');
                }
                if ([95, 96, 99].includes(w.weather_code)) {
                  suggestions.push('有雷暴，尽量避免外出，关闭电器设备');
                }
                if ([45, 48].includes(w.weather_code)) {
                  suggestions.push('有雾，能见度较低，驾车出行请注意安全');
                }

                // 风速建议
                if (windSpeed > 40) {
                  suggestions.push('风速较大，避免在广告牌、临时搭建物下停留');
                } else if (windSpeed > 20) {
                  suggestions.push('风力较大，注意防风');
                }

                // 运动建议
                if ([61, 63, 65, 71, 73, 75, 80, 81, 82, 85, 86, 95, 96, 99].includes(w.weather_code)) {
                  suggestions.push('天气条件不佳，建议在室内进行运动');
                } else if (temp >= 10 && temp <= 28 && ![45, 48].includes(w.weather_code)) {
                  suggestions.push('天气适合户外运动，但请注意适量');
                }

                content = `📍 ${city} 今日天气详情\n\n` +
                  `🌡️ 温度: ${w.temperature_2m}°C（体感 ${w.apparent_temperature}°C）\n` +
                  `💧 湿度: ${w.relative_humidity_2m}%\n` +
                  `🌬️ 风向: ${w.wind_direction_10m}°（风速 ${w.wind_speed_10m} km/h）\n` +
                  `☁️ 天气: ${weatherDesc}\n` +
                  `☀️ 紫外线指数: ${w.uv_index || '未知'}\n` +
                  `🕐 更新时间: ${data.current.time}\n\n` +
                  `💡 生活建议:\n${suggestions.map(s => '• ' + s).join('\n')}`;
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
            const now = new Date();
            const timeStr = now.toLocaleString('zh-CN', {
              timeZone: timezone,
              timeZoneName: 'long',
            });
            const hour = now.toLocaleString('zh-CN', { timeZone: timezone, hour: '2-digit', hour12: false });
            const hourNum = parseInt(hour);

            // 生成建议
            let suggestion = '';
            if (hourNum >= 6 && hourNum < 9) {
              suggestion = '早上好！是一天中最清醒的时间，适合处理重要工作或学习';
            } else if (hourNum >= 9 && hourNum < 12) {
              suggestion = '上午好！适合集中精力完成上午的工作任务';
            } else if (hourNum >= 12 && hourNum < 14) {
              suggestion = '午休时间！建议适当休息，为下午的工作充电';
            } else if (hourNum >= 14 && hourNum < 18) {
              suggestion = '下午好！继续处理工作，也可以适当活动放松';
            } else if (hourNum >= 18 && hourNum < 22) {
              suggestion = '晚上好！是放松和休息的好时光，可以陪伴家人或进行娱乐活动';
            } else if (hourNum >= 22 || hourNum < 6) {
              suggestion = '夜深了！建议休息，保持良好的作息习惯';
            }

            content = `🕐 当前时间信息\n\n` +
              `📍 时区: ${timezone}\n` +
              `📅 日期时间: ${timeStr}\n\n` +
              `💡 温馨提示: ${suggestion}`;
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
