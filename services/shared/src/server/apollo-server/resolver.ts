/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import GraphQLJSON from "graphql-type-json";
import lodash from "lodash";
import {
  combineResolversWithAuthenticated,
  customTypeResolver,
  directoryGraphql,
  getRootPathAndDirectory,
} from "./common";

const enum Resolver {
  Query = "Query",
  Subscription = "Subscription",
  Mutation = "Mutation",
}

export function getRootResolver() {
  const { rootPath, directories } = getRootPathAndDirectory();
  const mapAuthenticated = (target) => {
    if (!target) {
      return target;
    }

    Object.keys(target).forEach((e) => {
      target[e] = combineResolversWithAuthenticated(target[e]);
    });

    return target;
  };
  const arrTypeResolver = [Resolver.Query, Resolver.Mutation, Resolver.Subscription];
  let resolver = {};

  directories.forEach((e) => {
    const { gqlResolver } = require(`${rootPath}/${directoryGraphql}/${e}/resolver`);
    /* tslint:disable */
    if (gqlResolver) {
      resolver = { ...resolver, ...lodash.omit(gqlResolver, arrTypeResolver) };
      arrTypeResolver.forEach((r) => {
        resolver[r] = { ...resolver[r], ...mapAuthenticated(gqlResolver[r]) };
      });
    }
    /* tslint:enable */
  });

  return lodash.omitBy({ ...resolver, ...customTypeResolver, JSON: GraphQLJSON }, lodash.isEmpty);
}
