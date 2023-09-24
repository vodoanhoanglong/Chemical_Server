/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-var-requires */
import { mergeTypeDefs } from "@graphql-tools/merge";
import { gql } from "apollo-server-express";
import { getOperationAST } from "graphql";
import lodash from "lodash";
import {
  customTypeSchema,
  directoryGraphql,
  getRootPathAndDirectory,
  gqlCommonSchema,
  mappingTypeName,
} from "./common";

export function getRootSchema() {
  const gqlSchemas = [];
  const { rootPath, directories } = getRootPathAndDirectory();
  directories.forEach((e) => {
    const { gqlSchema } = require(`${rootPath}/${directoryGraphql}/${e}/schema`);
    gqlSchemas.push(gqlSchema);
  });

  return mergeTypeDefs([customTypeSchema, gqlCommonSchema, ...lodash.compact(gqlSchemas)]);
}

export function getJoiSchema() {
  const joiSchemas = [];
  const { rootPath, directories } = getRootPathAndDirectory();
  directories.forEach((e) => {
    const data = require(`${rootPath}/${directoryGraphql}/${e}/schema`);
    Object.keys(data).forEach((d) => {
      if (data[d].isJoi) {
        joiSchemas.push(mappingTypeName(data[d], d));
      }
    });
  });

  return joiSchemas;
}

export function isIntrospectionQuery(body: { query: string; operationName: string }) {
  const document = gql(body.query);
  const operation = document && getOperationAST(document);
  return (
    body.operationName === "IntrospectionQuery" &&
    operation.selectionSet.selections.every((selection) => {
      const fieldName = selection["name"]["value"] as string;
      return fieldName.startsWith("__");
    })
  );
}
