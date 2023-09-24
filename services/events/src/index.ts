import {
  ErrorKey,
  HasuraHeader,
  IRequest,
  SystemUser,
  graphqlError,
  initDatabase,
  initServerExpress,
  isIntrospectionQuery,
} from "shared";

initDatabase("thchemical", {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
});

initDatabase("geo", {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_GEO_DB,
  username: process.env.POSTGRES_USER,
});

initServerExpress({
  logName: process.env.LOG_NAME,
  apolloServer: {
    context: async ({ req }: { req: IRequest }) => {
      if (isIntrospectionQuery(req.body)) {
        return null;
      }

      const userId = req.headers[HasuraHeader.UserId] as string;

      if (userId) {
        const currentUser = await SystemUser.findByPk(userId);
        // req.headers[HasuraHeader.Role] === Role.Moderator
        //   ? await SystemUser.findByPk(userId)
        //   : await Customer.findByPk(userId);

        if (currentUser) return { currentUser, req };

        return graphqlError(req, ErrorKey.CurrentUserNotFound);
      }
    },
  },
});
