/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { validate } from "@hapi/joi";
import { AuthenticationError } from "apollo-server-express";
import { combineResolvers, skip } from "graphql-resolvers";
import lodash from "lodash";
import moment from "moment-timezone";
import { graphqlError } from "../../../helpers";
import { ErrorKey, getMessageError } from "../../../resources";
import { getJoiSchema } from "../schema";

export const gqlBaseModelResolver = () => ({
  createdAt(model: any): string {
    return moment(model.createdAt).toISOString();
  },
  updatedAt(model: any): string {
    return moment(model.createdAt).toISOString();
  },
});

export const wrapperHandle = (handle) => {
  return async (parent, args, context, info) => {
    try {
      return await handle(parent, args, context, info);
    } catch (error) {
      return graphqlError(context.req, error);
    }
  };
};

export const isAuthenticated = (_parent, _args, { currentUser }) =>
  currentUser ? skip : new AuthenticationError(getMessageError(ErrorKey.UnAuthentication));

export const combineResolversWithAuthenticated = (handle) => {
  handle = (Array.isArray(handle) ? handle : [handle]).map(wrapperHandle);
  const args = [isAuthenticated].concat([validateSchemaGraphQL]).concat(Array.isArray(handle) ? handle : [handle]);

  return combineResolvers(...args);
};

let joiSchemas;
export const validateSchemaGraphQL: any = (_, args, _context, info) => {
  joiSchemas =
    joiSchemas ||
    getJoiSchema().map((e) => ({
      typeName: lodash.first(lodash.compact(lodash.map(e.describe().meta, "typeName"))),
      schema: e,
    }));
  const parentType = info.parentType;
  const fieldName = info.fieldName;
  const argTypes = info.schema[`get${parentType}Type`]().getFields()[fieldName].args;
  const errorValidation = argTypes
    .map((e) => ({
      name: e.name,
      type: lodash.get(e, "type.ofType", "").toString(),
    }))
    .filter((e) => {
      return joiSchemas.find((f) => f.typeName === e.type);
    })
    .map((e) => ({
      ...e,
      schema: joiSchemas.find((f) => f.typeName === e.type).schema,
    }))
    .map((e) => validate(args[e.name], e.schema))
    .filter((e) => e.error)
    .map((e) => e.error.message);

  if (errorValidation.length > 0) {
    return Promise.reject(errorValidation);
  }

  return skip;
};
