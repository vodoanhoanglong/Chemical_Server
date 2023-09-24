import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({ tableName: "province", timestamps: false })
export class Province extends Model<Province> {
  @PrimaryKey
  @Column
  public country_code: string;

  @Column
  public code: string;

  @Column
  public name: string;
}
