import { ReplicationOptions } from "sequelize";
import { SequelizeOptions } from "sequelize-typescript";
import { safeParseInt } from "../../helpers";
import { getLogger } from "../../helpers/logging";

export function defaultSequelizeConfig(): SequelizeOptions {
  return {
    dialect: "postgres",
    logging: (msg, timing) => getLogger().debug({ timing }, msg),
    pool: {
      max: safeParseInt(process.env.MAX_POOL_CONNECTION, 10),
      min: safeParseInt(process.env.MIN_POOL_CONNECTION, 0),
      acquire: safeParseInt(process.env.POSTGRES_ACQUIRE, 30000),
      idle: safeParseInt(process.env.POSTGRES_IDLE, 10000),
      evict: safeParseInt(process.env.POSTGRES_EVICT, 1000),
    },
    logQueryParameters: true,
    benchmark: true,
  };
}

export function parseSequelizeConfig(config: ReplicationOptions | SequelizeOptions): SequelizeOptions {
  if ("read" in config && "write" in config && config.read.filter((e) => e.host).length === 0) {
    config = {
      database: config.write.database,
      host: config.write.host,
      password: config.write.password,
      port: config.write.port,
      username: config.write.database,
    } as SequelizeOptions;
  }

  return { ...defaultSequelizeConfig(), ...config };
}
