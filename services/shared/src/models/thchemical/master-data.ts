import { Column, Table } from "sequelize-typescript";
import { BaseModel } from "../base";

@Table({ tableName: "master_data" })
export class MasterData extends BaseModel<MasterData> {
  @Column
  public data: string;

  @Column
  public type: string;
}
