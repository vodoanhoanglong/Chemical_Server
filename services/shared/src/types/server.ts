import { Request } from "express";
import { Model, ModelCtor } from "sequelize-typescript";
import { ILogger } from "../helpers/logging";

export type ModelSequelize<M extends Model = Model> = ModelCtor<M>;
export declare type IModelStatic = Model;

export interface IRequest<M extends IModelStatic = IModelStatic, B = any> extends Request {
  log: ILogger;
  currentUser: ModelSequelize<M>;
  body: B;
}

export interface IError extends Partial<Error> {
  name?: string;
  code: string;
  message: string;
  debugMessage?: string;
}
