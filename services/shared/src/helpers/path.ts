import { readdirSync } from "fs";
import path from "path";

export function getRootPath() {
  return path.dirname(require.main.filename || process.mainModule.filename);
}
export const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

export const getFiles = readdirSync;
