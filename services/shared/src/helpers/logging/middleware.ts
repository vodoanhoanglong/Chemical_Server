import * as lb from "@google-cloud/logging-bunyan";
import Bunyan from "bunyan";
import BunyanFormat from "bunyan-format";
import { Express, NextFunction, Response } from "express";
import morgan from "morgan";
import { IRequest, NodeEnv } from "../../types";
import { responseError } from "../exception";
import { DefaultLogger, ILogger, IParamLogger } from "./default";
import { getTrace, logRequest } from "./log-request";

let defaultLogger: ILogger = DefaultLogger;

// handle log google
function makeChildLogger(trace) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (defaultLogger as any).child({ [lb.LOGGING_TRACE_KEY]: trace }, true /* simple child */);
}

export async function logMiddleware(app: Express, { logName, service }): Promise<void> {
  try {
    if (process.env.NODE_ENV === NodeEnv.Local) {
      app.use(morgan("dev"));
    }

    let projectId;
    const streamLogs = [{ stream: BunyanFormat({ outputMode: "short" }), level: process.env.LEVEL_LOG || "debug" }];
    logName = logName || "default";

    // Google log
    if (process.env.SERVICE_LOG && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const streamLogGoogleCloud = new lb.LoggingBunyan({
        logName,
        serviceContext: {
          service,
          version: process.env.NODE_ENV || NodeEnv.Develop,
        },
      });

      streamLogs.push(streamLogGoogleCloud.stream((process.env.LEVEL_LOG_GOOGLE || "debug") as any) as any);
      projectId = await streamLogGoogleCloud.stackdriverLog.logging.auth.getProjectId();
    }

    const logger = Bunyan.createLogger({
      name: logName,
      streams: streamLogs as any,
    });

    defaultLogger = logger;

    app.use((req: IRequest, res: Response, next: NextFunction) => {
      try {
        req.log = projectId ? makeChildLogger(getTrace(req, projectId)) : defaultLogger;

        return next();
      } catch (error) {
        return responseError(req, res, error);
      }
    });
    app.use(logRequest);

    // exception
    process.on("unhandledRejection", (error: IParamLogger) => {
      defaultLogger || defaultLogger.error(error, "unhandledRejection");
    });
  } catch (error) {
    defaultLogger || defaultLogger.error(error, "unhandledRejection");
  }
}

export function getLogger(): ILogger {
  return defaultLogger;
}

export { defaultLogger as logger };
