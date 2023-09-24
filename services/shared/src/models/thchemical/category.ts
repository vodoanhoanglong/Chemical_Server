import { Column, DataType, Table } from "sequelize-typescript";
import { BaseModel } from "../base";

@Table({ tableName: "categories" })
export class Category extends BaseModel<Category> {
  @Column
  public code: string;

  @Column
  public name: string;

  @Column
  public description: string;

  @Column(DataType.JSONB)
  public images: string[];

  @Column(DataType.JSONB)
  public metadata: object;
}
