import { AnySchema, ValidationError, ValidationOptions } from "@hapi/joi";
import { NextFunction, Response } from "express";
import { responseError } from "../../helpers";
import { IRequest } from "../../types";

function commonValidator(schema: AnySchema, key: string, options?: ValidationOptions) {
  return async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const value = req[key];
      await validateSchema(value, schema, options);

      return next();
    } catch (error) {
      return responseError(req, res, error);
    }
  };
}

export function validateSchema(value: any, schema: AnySchema, options?: ValidationOptions) {
  return new Promise((resolve, reject) => {
    return schema
      .validate(value, options)
      .then(() => {
        return resolve(true);
      })
      .catch((errors: ValidationError) => {
        const firstError = errors.details[0];
        const error = {
          code: firstError.type,
          message: firstError.message,
        };
        return reject(error);
      });
  });
}

export function validateParams(schema: AnySchema, options?: ValidationOptions) {
  return commonValidator(schema, "params", options);
}

export function validateBody(schema: AnySchema, options?: ValidationOptions) {
  return commonValidator(schema, "body", options);
}

export function validateQuery(schema: AnySchema, options?: ValidationOptions) {
  return commonValidator(schema, "query", {
    ...options,
    allowUnknown: true,
  });
}

export function validateHeader(schema: AnySchema, options?: ValidationOptions) {
  return commonValidator(schema, "headers", options);
}
