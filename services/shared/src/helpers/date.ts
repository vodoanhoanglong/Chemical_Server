import moment from "moment-timezone";
import { IDate } from "../models";
import { FORMAT_DATE_REVERSE, TimezoneVN } from "../types";

export function formatDateTimezone(date: IDate, format: string = FORMAT_DATE_REVERSE, tz = TimezoneVN) {
  if (!date) return null;

  return moment(date).tz(tz).format(format);
}
