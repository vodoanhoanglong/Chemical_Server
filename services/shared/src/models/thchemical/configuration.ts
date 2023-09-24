import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { IDate, StatusCode } from "../base";
import { SystemUser } from "./system-user";

export enum ConfigurationKey {
  TokenExpireTime = "token_expire_time",
}

@Table({ tableName: "configurations" })
export class Configuration extends Model<Configuration> {
  @PrimaryKey
  @Column
  public key: string;

  @Column(DataType.DATE)
  public createdAt: IDate;

  @Column(DataType.DATE)
  public updatedAt: IDate;

  @ForeignKey(() => SystemUser)
  @Column
  public createdBy: string;

  @BelongsTo(() => SystemUser, "createdBy")
  public creator: SystemUser;

  @ForeignKey(() => SystemUser)
  @Column
  public updatedBy: string;

  @BelongsTo(() => SystemUser, "updatedBy")
  public updater: SystemUser;

  @Column
  public status: StatusCode;

  @Column
  public value: string;

  @Column
  public type: string;

  @Column
  public description: string;
}
