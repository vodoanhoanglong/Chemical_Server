import Joi from "@hapi/joi";
import { gql } from "apollo-server-express";

export const gqlCommonSchema = gql`
  scalar JSON
  scalar uuid

  input AddressInput {
    ward: String
    address: String
    district: String
    province: String
  }

  type Location {
    lat: Float
    long: Float
  }

  input LocationInput {
    lat: Float
    long: Float
  }

  enum SaleGender {
    male
    female
  }

  type PaginationInfo {
    page: Int
    size: Int!
    totalPages: Int
    totalPerPage: Int
    total: Int!
    nextPageToken: String
  }
`;

export function SchemaPagination(modelName: string) {
  return `
    type Pagination${modelName} {
      data: [${modelName}]
      pagination: PaginationInfo
    }
  `;
}

export const SchemaParamPagination = Joi.object({
  page: Joi.number(),
  size: Joi.number(),
  order: Joi.array().items(Joi.string()),
  nextPageToken: Joi.string(),
});

export const ParamPagination = {
  page: Joi.number(),
  size: Joi.number(),
  order: Joi.array().items(Joi.string()),
  nextPageToken: Joi.string(),
};
