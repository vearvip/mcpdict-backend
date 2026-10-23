import { Elysia } from "elysia";
import { AppError } from "../errors";

// 创建一个插件用于捕获异常
export const errorFormatterPlugin = (app: Elysia) => {
  return app.onError(({ code, error, set, request }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        code: "NOT_FOUND",
        message: "接口不存在",
      };
    }

    if (error instanceof AppError) {
      set.status = error.status;
      return {
        success: false,
        code: error.code,
        message: error.message,
      };
    }

    if (code === "VALIDATION" || code === "PARSE") {
      set.status = 400;
      return {
        success: false,
        code: code === "PARSE" ? "PARSE_ERROR" : "VALIDATION_ERROR",
        message: "请求参数不合法",
      };
    }

    const requestId = crypto.randomUUID();
    console.error(
      `[${requestId}] ${request.method} ${request.url}`,
      error instanceof Error ? error.stack ?? error.message : error,
    );
    set.status = 500;
    return {
      success: false,
      code: "INTERNAL_ERROR",
      message: "服务内部错误",
      requestId,
    };
  });
};

// 创建一个插件用于包装返回信息
export const responseFormatterPlugin = (app: Elysia) => {
  return app.onAfterHandle(({ request, response }) => {
    // 检查请求路径是否为Swagger相关路径
    if (request.url.includes("/swagger")) {
      return response; // 如果是Swagger相关请求，直接返回原始响应
    }

    if (response instanceof Response) {
      return response; // 如果是原生Response对象，不做处理
    }

    return {
      success: true,
      data: response,
    };
  });
};
