import { BelongsTo, Column, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "../base";
import { MasterData } from "./master-data";

@Table({ tableName: "blogs" })
export class Blog extends BaseModel<Blog> {
  @Column
  public code: string;

  @Column
  public title: string;

  @Column
  public content: string;

  @Column
  public description: string;

  @Column
  public banner: string;

  @ForeignKey(() => MasterData)
  @Column
  public typeId: string;

  @BelongsTo(() => MasterData)
  public type: MasterData;
}
