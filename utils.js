// 从流式文本中提取完整的 JSON 对象
function extractJsonObjects(text) {
  const results = []
  let i = 0
  
  while (i < text.length) {
    const startIndex = text.indexOf('{', i)
    if (startIndex === -1) break
    
    // 追踪花括号深度，处理嵌套
    let depth = 0
    let inString = false
    
    for (let j = startIndex; j < text.length; j++) {
      // ... 处理转义字符和字符串
      if (char === '{') depth++
      else if (char === '}') {
        depth--
        if (depth === 0) {
          // 找到完整的 JSON 对象
          results.push(text.slice(startIndex, j + 1))
          break
        }
      }
    }
  }
  return results
}
