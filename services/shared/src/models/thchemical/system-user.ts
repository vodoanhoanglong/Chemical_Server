import { Column, DataType, Table } from "sequelize-typescript";
import { Role } from "../../types";
import { BaseModel, Gender, IDate } from "../base";

@Table({ tableName: "system_users" })
export class SystemUser extends BaseModel<SystemUser> {
  @Column
  public code: string;

  @Column
  public fullName: string;

  @Column
  public email: string;

  @Column
  public identityCard: string;

  @Column
  public phoneNumber: string;

  @Column
  public gender: Gender;

  @Column
  public role: Role;

  @Column(DataType.DATE)
  public dateOfBirth: IDate;

  @Column
  public avatar: string;

  @Column
  public password: string;
}
