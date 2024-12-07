import { readFile } from 'fs/promises'; 

// 自定义包装所有路由处理器
export function wrapRouteHandler(handler) {
  return async (req, res, next) => {
    try {
      const result = await handler(req, res, next);

      // 如果路由处理器返回了一个结果，则视为正常响应
      if (result !== undefined) {
        res.json({
          success: true,
          data: result
        });
      }
    } catch (err) {
      // 捕获任何未处理的异常，并将其传递给错误处理中间件
      next(err);
    }
  };
}

export async function loadGeoJSON(filePath: string) {
  try {

    // 异步读取文件内容，并指定编码为 utf8
    const geojsonData = await readFile(filePath, 'utf8');

    // 将字符串内容解析为 JavaScript 对象
    const geojsonObject = JSON.parse(geojsonData);
 
    return geojsonObject;
  } catch (error) {
    console.error('读取geojson文件失败:', error);
    return null;
  } 
}
