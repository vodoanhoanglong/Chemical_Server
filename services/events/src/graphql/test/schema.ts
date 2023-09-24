import { Role, gql } from "shared";

export const gqlSchema = gql`
  type Query {
    hello: String! @hasRoles(roles: [
      "${Role.Moderator}",
    ])
  }
`;
