import { Column, Table } from "sequelize-typescript";
import { BaseModel } from "./base";

@Table({})
export class BaseAddress<M> extends BaseModel<M> {
  @Column
  public address: string;

  @Column
  public wardName: string;

  @Column
  public districtName: string;

  @Column
  public provinceName: string;

  @Column
  public ward: string;

  @Column
  public district: string;

  @Column
  public province: string;
}
