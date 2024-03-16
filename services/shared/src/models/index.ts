import { IInputModel, ISequelizeOption, initSequelize } from "./base";

export type ModuleModel = "default" | "geo";

export function initDatabase(models: IInputModel<ModuleModel>, opts: ISequelizeOption) {
  return initSequelize(null, models, opts, {
    basePathRequireModel: __dirname,
  });
}

export * from "./base";
export * from "./default";
export * from "./geo";
