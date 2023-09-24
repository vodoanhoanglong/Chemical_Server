import { Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({ tableName: "district", timestamps: false })
export class District extends Model<District> {
  @PrimaryKey
  @Column
  public country_code: string;

  @PrimaryKey
  @Column
  public province_code: string;

  @Column
  public code: string;

  @Column
  public name: string;
}
