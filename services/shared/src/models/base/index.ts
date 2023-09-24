import SequelizeInstance from "sequelize";
import { ModelCtor, Sequelize, SequelizeOptions } from "sequelize-typescript";
import { ModuleModel } from "..";
import { parseSequelizeConfig } from "./postgres-replication";

export type IInputModel<Module = any> = Module | ModelCtor[];
export type ISequelizeOption = SequelizeInstance.ReplicationOptions | SequelizeOptions;

interface IOptionGetModel {
  basePathRequireModel?: string;
  folderModel?: string;
}

export function initSequelize(
  sequelizeInstance: any,
  param: IInputModel,
  opts: ISequelizeOption,
  getModelOptions: IOptionGetModel,
) {
  console.log(`Database is being setup`, param || "");
  const option: SequelizeOptions = parseSequelizeConfig(opts);
  option.models = typeof param === "string" || param === null ? getModelsByModule(param, getModelOptions) : param;

  return new Sequelize(option);
}

export function getModelsByModule(param: ModuleModel, getModelOptions?: IOptionGetModel): ModelCtor[] {
  let { basePathRequireModel } = getModelOptions;
  basePathRequireModel = basePathRequireModel || "..";

  return Object.values(param ? require(`${basePathRequireModel}/${param}`) : require(`${basePathRequireModel}`)).filter(
    (e) => {
      return e && e["name"] && e["prototype"];
    },
  ) as ModelCtor[];
}

export * from "./address";
export * from "./base";
export * from "./postgres-replication";
export * from "./type";
