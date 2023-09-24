import { Moment } from "moment-timezone";

export enum StatusCode {
  Active = "active", // Can login
  Suspended = "suspended", // Account was suspended
  Deleted = "deleted", // Account was deleted
  Blocked = "blocked", // Cannot login
  Inactive = "inactive",
}

export type IDate = Date | Moment | string;

export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}
