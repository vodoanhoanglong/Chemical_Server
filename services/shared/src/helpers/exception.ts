import { ApolloError } from "apollo-server-express";
import { Response } from "express";

import { difference } from "lodash";
import { ErrorKey, IOptionMessageError, checkErrorCodeExist, getMessageError } from "../resources";
import { IError, IRequest, LangType, NodeEnv } from "../types";
import { ILogger, getPayloadRequest } from "./logging";

export interface IOptionError extends IOptionMessageError {
  statusCode?: number;
}

function parseError(error: any): IError {
  const result = {} as IError;
  result.code = checkErrorCodeExist(error.code) ? error.code : "internal_error";
  result.message = error.message || "INTERNAL ERROR";
  if (error.debugMessage) {
    result.debugMessage = error.debugMessage;
  }

  return result;
}

function parseLevelLog(error, logger: ILogger): keyof ILogger | number {
  if (error.stack && error.stack !== "" && typeof error.stack === "string") {
    if (!logger.fatal) {
      return "error";
    }

    return "fatal";
  }

  return "error";
}

export function responseError(
  req: IRequest,
  res: Response,
  error: any,
  options: IOptionError = { statusCode: 400 },
): Response {
  const statusCode = options.statusCode;
  const language = req["headers.language"] || LangType.En;
  req.log[parseLevelLog(error, req.log)](
    {
      error,
      req: {
        body: req.body,
        headers: req.headers,
        params: req.params,
      },
      stack: error.stack || "",
    },
    error,
  );
  // case production
  if (process.env.NODE_ENV === NodeEnv.Production) {
    const code = typeof error === "string" ? error : ErrorKey.UnknownError;

    return res.status(statusCode).json(
      parseError({
        code,
        message: getMessageError(code, options, language) || getMessageError(ErrorKey.UnknownError, options, language),
      }),
    );
  }

  // case not production
  if (typeof error === "string") {
    return res.status(statusCode).json(
      parseError({
        code: error,
        message: getMessageError(error, options, language),
      }),
    );
  }
  if (typeof error === "object") {
    const errorCode = error.code || "error_unknown";

    return res.status(statusCode).json(
      parseError({
        code: errorCode,
        message: error.message || getMessageError(errorCode, options, language),
        debugMessage: error.stack || error.message,
      }),
    );
  }

  return res.status(statusCode).json(parseError(error));
}

export function graphqlError(req: IRequest, error: any, options: IOptionError = { params: null }): ApolloError {
  req.log[parseLevelLog(error, req.log)](
    {
      ...getPayloadRequest(req),
      error,
      stack: error.stack,
    },
    error,
  );
  let message;
  const language = req["headers.language"] || LangType.En;
  if (process.env.NODE_ENV === NodeEnv.Production) {
    message =
      typeof error === "string"
        ? getMessageError(error, options, language)
        : getMessageError(ErrorKey.UnknownError, options, language);

    return new ApolloError(message || getMessageError(ErrorKey.UnknownError, options, language), error);
  }

  message = typeof error === "string" ? getMessageError(error, undefined, language) : error.message;

  return new ApolloError(message, error);
}

export function hasUniqueError(error, key: string[]) {
  if (error.name === "SequelizeUniqueConstraintError") {
    const currentKey = Object.keys(error.fields);
    if (key) {
      if (difference(key, currentKey).length === 0) {
        return true;
      }
      return false;
    }
    return true;
  }
  return false;
}
