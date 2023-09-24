export interface IParamLogger {
  [key: string]: any;
  err?: any;
  error?: any;
  res?: any;
  req?: any;
  labels?: {
    type: any;
  };
}

export type ParamLogger = IParamLogger;

export interface ILogger {
  debug: (payload: ParamLogger, msg: string) => void;
  info: (payload: ParamLogger, msg: string) => void;
  warn: (payload: ParamLogger, msg: string) => void;
  error: (payload: ParamLogger, msg: string) => void;
  fatal: (payload: ParamLogger, msg: string) => void;
}

export const DefaultLogger: ILogger = {
  debug: console.log,
  info: console.log,
  warn: console.warn,
  error: console.error,
  fatal: console.error,
};
