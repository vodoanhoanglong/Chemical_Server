import { getDirectories, getRootPath } from "../../../helpers";

export * from "./custom-type";
export * from "./joiql";
export * from "./resolver";
export * from "./schema";

export const directoryGraphql = "graphql";

export function getRootPathAndDirectory(): {
  rootPath: string;
  directories: string[];
} {
  const rootPath = getRootPath();

  return {
    rootPath,
    directories: getDirectories(`${rootPath}/${directoryGraphql}`).filter((e) => !["client", "common"].includes(e)),
  };
}
