import { Elysia } from "elysia"; 
 
// 创建一个插件用于捕获异常
export const errorFormatterPlugin = (app: Elysia) => {
  return app.onError(({ code, error }) => {
    // console.error('error', error) 
    if (code === 'NOT_FOUND') {
        return {
          success: false,
          message: '你迷路了老铁😜'
        }
    }

    return {
      success: false,
      message: error?.message ?? '未知错误'
    };
  });
};
// 创建一个插件用于包装返回信息
export const responseFormatterPlugin = (app: Elysia) => {
  return app.onAfterHandle(({ request, response }) => {
    // 检查请求路径是否为Swagger相关路径
    if (request.url.includes('/swagger')) {
      return response; // 如果是Swagger相关请求，直接返回原始响应
    }

    if (response instanceof Response) {
      return response; // 如果是原生Response对象，不做处理
    }
 
    return {
      success: true,
      data: response
    };
  });
};
