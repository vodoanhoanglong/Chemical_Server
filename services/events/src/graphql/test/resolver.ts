import { graphqlError, IContext, IResolvers, SystemUser } from "shared";

export const gqlResolver: IResolvers<unknown, IContext<SystemUser>> = {
  Query: {
    hello(_, _f, { req, currentUser }) {
      try {
        return currentUser.fullName;
      } catch (error) {
        return graphqlError(req, error);
      }
    },
  },
};
