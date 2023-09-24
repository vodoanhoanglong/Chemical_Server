import { Column, Table } from "sequelize-typescript";
import { BaseModel } from "../base";

@Table({ tableName: "contacts" })
export class Contact extends BaseModel<Contact> {
  @Column
  public email: string;

  @Column
  public phoneNumber: string;

  @Column
  public fullName: string;
}
