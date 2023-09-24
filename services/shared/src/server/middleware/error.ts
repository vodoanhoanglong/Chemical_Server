import { NextFunction, Response } from "express";
import { IRequest } from "../../types";

export function ErrorHandlerMiddleware(error: Error, _req: IRequest, res: Response, next: NextFunction) {
  if (error) {
    return res.status(500).json({
      code: "internal",
      message: error.message,
      debugMessage: error.stack,
    });
  }

  return next();
}
