import bodyParser, { OptionsJson } from "body-parser";
import cors, { CorsOptions, CorsOptionsDelegate } from "cors";
import express, { Express, Response } from "express";
import { initRouters, logMiddleware, safeParseInt } from "../helpers";
import { NodeEnv } from "../types";
import { IParamInitApolloServer, initApolloServer } from "./apollo-server";

interface IConfInitServerExpress {
  logName?: string;
  apolloServer?: boolean | IParamInitApolloServer;
  listenAppStarted?: (app?: Express) => void;
  expressOptions?: {
    bodyParserJson?: OptionsJson;
    cors?: CorsOptions | CorsOptionsDelegate;
  };
}

export async function initServerExpress({
  logName,
  apolloServer,
  listenAppStarted,
  expressOptions,
}: IConfInitServerExpress) {
  const PORT = safeParseInt(process.env.PORT, 9000);
  const HOST = process.env.HOST || "0.0.0.0";
  const ENV = process.env.NODE_ENV || NodeEnv.Develop;
  const app = express();

  app.get("/health", (_, res: Response) => res.status(200).send("OK"));
  app.use(bodyParser.json(expressOptions?.bodyParserJson));
  app.use(cors(expressOptions?.cors));

  const apolloServerFunc = async () => {
    const graphql = await initApolloServer(typeof apolloServer === "object" ? apolloServer : {});
    await graphql.start();
    graphql.applyMiddleware({ app });
  };

  await logMiddleware(app, { logName, service: logName });
  await Promise.all([initRouters(app), apolloServer && apolloServerFunc()]);

  app.listen(PORT, HOST, () => {
    console.log("Express server listening on %d, in %s mode", PORT, ENV);
    listenAppStarted && listenAppStarted(app);
  });
}
