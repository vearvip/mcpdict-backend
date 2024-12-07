import express from 'ultimate-express';
// 创建一个自定义的中间件来包装 res.send 的调用 
export const notFoundMiddleware = (req, res, next) => {
  // 设置404状态码和响应信息
  res.status(404).json({
    success: false,
    message: '请请求正确的路由'
  });
}