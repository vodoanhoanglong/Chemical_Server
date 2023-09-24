import { BelongsTo, Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { BaseModel } from "../base";
import { Category } from "./category";

@Table({ tableName: "products" })
export class Product extends BaseModel<Product> {
  @Column
  public code: string;

  @Column
  public name: string;

  @Column
  public description: string;

  @ForeignKey(() => Category)
  @Column
  public categoryId: string;

  @BelongsTo(() => Category)
  public category: Category;

  @Column
  public price: number;

  @Column(DataType.JSONB)
  public images: string[];

  @Column(DataType.JSONB)
  public metadata: object;
}
