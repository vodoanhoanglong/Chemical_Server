import J from "@hapi/joi";
import JoiDate from "@hapi/joi-date";
import { gql } from "apollo-server-express";
import { GraphQLError, GraphQLScalarType } from "graphql";
import { FORMAT_DATE_TIME } from "../../../types";
import { validateSchema } from "../../middleware";

const Joi: J.Root = J.extend(JoiDate);

export function validateDateTime(data) {
  return validateSchema(data, Joi.date().format(FORMAT_DATE_TIME), { allowUnknown: true })
    .then(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    })
    .catch((error) => {
      // eslint-disable-next-line functional/no-throw-statement
      throw new GraphQLError(error.message);
    });
}

const DATE_TIME_TYPE_NAME = "DateTime";

export const customTypeResolver = {
  [DATE_TIME_TYPE_NAME]: new GraphQLScalarType({
    name: DATE_TIME_TYPE_NAME,
    description: "Type DateTime with fixed format",
    serialize(value) {
      return value;
    },
    parseValue(value) {
      return value;
    },
    parseLiteral(data: any) {
      const resultValidate = J.validate(data.value, Joi.date().format(FORMAT_DATE_TIME));
      if (resultValidate.error) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new GraphQLError(resultValidate.error.message);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data.value;
    },
  }),
};

export const customTypeSchema = gql`
  scalar ${DATE_TIME_TYPE_NAME}
`;
