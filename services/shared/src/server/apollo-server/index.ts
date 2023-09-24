/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { mergeTypeDefs } from "@graphql-tools/merge";
import { RedisCache } from "apollo-server-cache-redis";
import { ApolloServer, ApolloServerExpressConfig } from "apollo-server-express";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import axios from "axios";
import fs from "fs";
import { GraphQLSchema, print } from "graphql";

import { makeExecutableSchema, mergeSchemas } from "@graphql-tools/schema";
import { FilterRootFields, FilterTypes, RenameTypes, introspectSchema, wrapSchema } from "@graphql-tools/wrap";
import lodash, { compact } from "lodash";
import { safeParseJSON, toCamelCaseAndSingularWord } from "../../helpers";
import { HasuraHeader } from "../hasura";
import { mapJoiToGQL } from "./common";
import { roleDirective } from "./directive";
import { getRootResolver } from "./resolver";
import { getJoiSchema, getRootSchema } from "./schema";

const { REMOTE_SCHEMA_HOST, HASURA_GRAPHQL_ADMIN_SECRET, CACHE_HOST, CACHE_PASSWORD } = process.env;

const fetcher = async ({ document, variables }) => {
  const fileSchema = "./src/graphql/schema.graphql";
  const callDataHost = async () => {
    try {
      const query = print(document);
      const { data } = await axios(`${REMOTE_SCHEMA_HOST}/v1/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [HasuraHeader.AdminSecret]: HASURA_GRAPHQL_ADMIN_SECRET,
        },
        data: { query, variables },
      });
      // cache
      process.env.CACHE_SCHEMA && fs.writeFileSync(fileSchema, JSON.stringify(data));

      return data;
    } catch (error) {
      console.error("Remote schema fetcher", error);
      return safeParseJSON(fs.readFileSync(fileSchema, { encoding: "utf-8" }));
    }
  };
  try {
    if (!process.env.CACHE_SCHEMA && fs.existsSync(fileSchema)) {
      return safeParseJSON(fs.readFileSync(fileSchema, { encoding: "utf-8" }));
    }

    return callDataHost();
  } catch (error) {
    console.error("Remote schema fetcher", error);
    return callDataHost();
  }
};

// create executable schemas from remote GraphQL API
export const createRemoteExecutableSchema = async (types?: string[]) => {
  try {
    const remoteSchema = await introspectSchema(fetcher);
    return wrapSchema({
      schema: remoteSchema,
      transforms: compact([
        new FilterRootFields(() => false),
        new FilterTypes((type) => {
          const text = type.toString();
          return /^[a-z|\_]*?$/.test(text) ? true : false;
        }),
        new RenameTypes(toCamelCaseAndSingularWord),
        types?.length > 0 ? new FilterTypes((type) => types.includes(type.toString())) : null,
      ]),
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

export interface IParamInitApolloServer extends ApolloServerExpressConfig {
  typesRemoteSchema?: string[];
}

export async function initApolloServer({ typesRemoteSchema, context }: IParamInitApolloServer): Promise<ApolloServer> {
  const [joiSchema, resolvers, rootSchema, remoteSchema] = await Promise.all([
    mapJoiToGQL(getJoiSchema()),
    getRootResolver(),
    getRootSchema(),
    REMOTE_SCHEMA_HOST ? await createRemoteExecutableSchema(typesRemoteSchema) : null,
  ]);

  const schemas = lodash.compact([
    remoteSchema,
    joiSchema
      ? new GraphQLSchema({
          types: joiSchema,
        })
      : null,
  ]);

  const { roleDirectiveTypeDefs, roleDirectiveTransformer } = roleDirective();

  let schema = makeExecutableSchema({
    resolvers,
    typeDefs: mergeTypeDefs(
      lodash.compact([roleDirectiveTypeDefs, schemas.length > 0 ? mergeSchemas({ schemas }) : null, rootSchema]),
    ),
  });

  schema = roleDirectiveTransformer(schema);

  return new ApolloServer({
    schema,
    context,
    plugins: lodash.compact([
      CACHE_HOST
        ? responseCachePlugin({
            cache: new RedisCache({
              host: CACHE_HOST,
              password: CACHE_PASSWORD,
            }),
          })
        : null,
    ]),
    introspection: true,
  });
}

export * from "./common";
export * from "./directive";
export * from "./resolver";
export * from "./schema";
export * from "./type";
