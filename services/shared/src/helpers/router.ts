/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Express } from "express";
import fs from "fs";
import { getDirectories, getRootPath } from "./path";

export async function initRouters(app: Express) {
  const rootPath = getRootPath();
  const directoryModuleName = "apis";
  const pathModule = `${rootPath}/${directoryModuleName}`;

  if (!fs.existsSync(pathModule)) {
    return app;
  }

  const directories = getDirectories(`${rootPath}/${directoryModuleName}`);
  directories.forEach((e) => {
    const { router } = require(`${rootPath}/${directoryModuleName}/${e}/router`);
    if (router) app.use(router);
  });

  return app;
}
