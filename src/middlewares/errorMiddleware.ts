import express from 'ultimate-express';
// 创建一个自定义的中间件来包装 res.send 的调用 
export const errorMiddleware = (err, req, res, next) => {
  // 设置状态码，默认500
  res.status(err.status || 500);

  // 发送错误信息
  res.json({
    success: false,
    message: err.message || '未知错误'
  });
}
