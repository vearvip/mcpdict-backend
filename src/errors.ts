export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message: string, code = "BAD_REQUEST") =>
  new AppError(400, code, message);

export const notFound = (message = "资源不存在") =>
  new AppError(404, "NOT_FOUND", message);

export const unsupported = (message: string, code = "UNSUPPORTED") =>
  new AppError(400, code, message);
