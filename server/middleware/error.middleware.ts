import type { HttpException } from "@server/utils/exceptions";
import type { NextFunction, Request, Response } from "express";

function errorMiddleware(
  error: HttpException,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  const isProd = process.env.NODE_ENV === "production";
  const status = error.status || 500;

  const message =
    status === 500 ? "Something went wrong, try again later" : error.message;

  const responseBody = {
    status,
    message,
    ...(isProd ? {} : { stack: error.stack, error: error.error }),
  };

  response.status(status).json(responseBody);
}

export default errorMiddleware;
