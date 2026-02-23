# RAG 知识库功能实现总结

## 已实现功能

### 1. 知识库管理 (IndexedDB 模块)

| 功能 | 状态 | 代码位置 |
|------|------|----------|
| 创建知识库 | ✅ 完成 | [webGPU.html:1135](webGPU.html#L1135) |
| 删除知识库 | ✅ 完成 | [webGPU.html:1158](webGPU.html#L1158) |
| 知识库列表 | ✅ 完成 | [webGPU.html:1143](webGPU.html#L1143) |
| 知识库重命名 | ❌ 未实现 | - |

### 2. 文档管理

| 功能 | 状态 | 代码位置 |
|------|------|----------|
| TXT 文件上传 | ✅ 完成 | [webGPU.html:2445](webGPU.html#L2445) |
| MD 文件上传 | ✅ 完成 | [webGPU.html:2445](webGPU.html#L2445) |
| PDF 文件上传 | ❌ 未实现 | - |
| 文档列表显示 | ✅ 完成 | [webGPU.html:1611](webGPU.html#L1611) |
| 删除文档 | ✅ 完成 | [webGPU.html:2503](webGPU.html#L2503) |
| 文档预览 | ❌ 未实现 | - |

### 3. 文本处理

| 功能 | 状态 | 代码位置 |
|------|------|----------|
| 文本分块 | ✅ 完成 | [webGPU.html:1355](webGPU.html#L1355) |
| 关键词检索 | ✅ 完成 | [webGPU.html:1349](webGPU.html#L1349) |
| Prompt 增强 | ✅ 完成 | [webGPU.html:1405](webGPU.html#L1405) |

### 4. UI 组件

| 功能 | 状态 | 代码位置 |
|------|------|----------|
| 知识库管理面板 | ✅ 完成 | [webGPU.html:1611](webGPU.html#L1611) |
| 知识库选择器 | ✅ 完成 | [webGPU.html:1821](webGPU.html#L1821) |
| 引用来源展示 | ✅ 完成 | [webGPU.html:486](webGPU.html#L486) |
| 导航栏入口 | ✅ 完成 | [webGPU.html:3025](webGPU.html#L3025) |

### 5. 集成功能

| 功能 | 状态 | 代码位置 |
|------|------|----------|
| RAG 问答流程 | ✅ 完成 | [webGPU.html:2512](webGPU.html#L2512) |
| 消息引用存储 | ✅ 完成 | [webGPU.html:2868](webGPU.html#L2868) |

---

## 功能详情

### 知识库 IndexedDB 模块 (KnowledgeDB)

```javascript
// 数据库: pudding-knowledge-db
// 对象存储:
//   - knowledgeBases: 知识库信息
//   - documents: 文档信息
//   - chunks: 文本块存储
```

核心方法：
- `createKnowledgeBase(data)` - 创建知识库
- `getAllKnowledgeBases()` - 获取所有知识库
- `deleteKnowledgeBase(id)` - 删除知识库（级联删除）
- `addDocument(data)` - 添加文档
- `addChunks(documentId, chunks)` - 添加文本块
- `getAllChunks(knowledgeBaseId)` - 获取知识库所有文本块

### 文本分块 (chunkText)

- 默认分块大小：500 字符
- 重叠长度：50 字符
- 智能断句：尽量在句号、逗号、换行符处分割

### 关键词检索 (searchChunks)

- 精确匹配整个查询：+10 分
- 关键词匹配：+5 分/词
- 关键词出现次数：+2 分/次
- 位置奖励（前50字）：+3 分
- 返回 top 5 结果

### RAG Prompt 构建

```javascript
你是一个基于知识库问答的AI助手。请根据以下参考资料回答用户的问题。

参考资料：
[来源1]: ...
[来源2]: ...

用户问题：...

请根据参考资料回答...
```

---

## 未实现功能清单

### P0 (高优先级)
- [ ] 知识库重命名
- [ ] PDF 文件支持
- [ ] 语义向量检索（@mlc-ai/web-embedding 包不存在）

### P1 (中优先级)
- [ ] 文档预览功能
- [ ] 检索结果相似度阈值设置
- [ ] 检索数量配置

### P2 (低优先级)
- [ ] 分块大小配置
- [ ] 存储空间统计

---

## 使用说明

1. 点击左侧导航栏的 📚 按钮打开知识库管理面板
2. 点击「新建知识库」创建知识库
3. 点击知识库右侧的箭头展开，上传 TXT 或 MD 文档
4. 在头部下拉框选择要使用的知识库
5. 提问时 AI 会自动使用关键词检索相关文档
6. AI 回复后可点击「参考资料」查看引用来源

---

## 技术说明

### 关于语义向量检索

**现状**：MLC AI 生态中没有可用的 browser embedding 包，`@mlc-ai/web-embedding` 包在 CDN 上不存在。

**当前方案**：使用关键词检索，通过以下方式提升检索效果：
- 精确匹配整个查询
- 关键词匹配
- 关键词出现次数加权
- 位置奖励（查询词出现在开头）

**如需语义检索**，可考虑：
1. 使用后端 API 服务（如 OpenAI Embedding API）
2. 等待 MLC AI 官方发布 web-embedding 包

---

## 技术限制

1. **纯前端方案**：所有数据存储在浏览器 IndexedDB 中
2. **关键词检索**：适合简单场景，复杂语义理解有限
3. **文件格式**：暂只支持 TXT 和 MD，PDF 需要集成 PDF.js
4. **存储空间**：受浏览器 IndexedDB 配额限制
