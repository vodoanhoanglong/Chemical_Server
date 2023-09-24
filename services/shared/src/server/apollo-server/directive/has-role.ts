/* eslint-disable functional/no-throw-statement */
import { MapperKind, getDirective, mapSchema } from "@graphql-tools/utils";
import { AuthenticationError } from "apollo-server-express";
import { ErrorKey, getMessageError } from "../../../resources";
import { HasuraHeader } from "../../hasura";

const directiveName = "hasRoles";
export function roleDirective() {
  const typeDirectiveArgumentMaps = {};
  return {
    roleDirectiveTypeDefs: `directive @${directiveName}(roles: [String!]) on OBJECT | FIELD_DEFINITION`,
    roleDirectiveTransformer: (schema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          const roleDirective = getDirective(schema, type, directiveName)?.[0];

          if (roleDirective) {
            typeDirectiveArgumentMaps[type.name] = roleDirective;
          }

          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const roleDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] || typeDirectiveArgumentMaps[typeName];

          if (roleDirective) {
            const { roles } = roleDirective;
            if (roles) {
              const { resolve } = fieldConfig;

              fieldConfig.resolve = (source, args, context, info) => {
                const userRole = context.req.headers[HasuraHeader.Role];
                if (userRole === "admin" /* Admin */ || roles.includes(userRole)) {
                  return resolve(source, args, context, info);
                }

                throw new AuthenticationError(getMessageError(ErrorKey.PermissionDenied));
              };

              return fieldConfig;
            }
          }
        },
      }),
  };
}
