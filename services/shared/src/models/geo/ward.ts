import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({ tableName: "ward", timestamps: false })
export class Ward extends Model<Ward> {
  @PrimaryKey
  @Column
  public country_code: string;

  @PrimaryKey
  @Column
  public province_code: string;

  @PrimaryKey
  @Column
  public district_code: string;

  @Column
  public code: string;

  @Column
  public name: string;
}
