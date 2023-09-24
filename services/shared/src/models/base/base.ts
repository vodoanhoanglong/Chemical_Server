import { AutoIncrement, Column, DataType, IsUUID, Model, PrimaryKey, Table } from "sequelize-typescript";
import { IDate, StatusCode } from "../base/type";

@Table({})
export class BaseModel<M> extends Model<M> {
  @IsUUID(4)
  @PrimaryKey
  @AutoIncrement
  @Column
  public id: string;

  @Column(DataType.DATE)
  public createdAt: IDate;

  @Column(DataType.DATE)
  public updatedAt: IDate;

  @Column
  public createdBy: string;

  @Column
  public updatedBy: string;

  @Column
  public status: StatusCode;
}
