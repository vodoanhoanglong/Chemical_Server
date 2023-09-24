/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-case-declarations */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* tslint:disable */
//
// Takes an object of { key: JoiSchema } pairs to generate a GraphQL Schema.
//
import * as Joi from "@hapi/joi";
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLUnionType,
} from "graphql";
import {
  List,
  PropertyName,
  capitalize,
  compact,
  find,
  first,
  flatten,
  fromPairs,
  get,
  isEmpty,
  isNull,
  map,
  mapValues,
  omit,
  omitBy,
  uniq,
  uniqBy,
  uniqueId,
} from "lodash";

// Convenience helpers to determine a Joi schema's
// "presence", e.g. required or forbidden
const presence = (desc, name) => desc.flags && desc.flags.presence && desc.flags.presence === name;

// Cache converted types by their `meta({ name: '' })` property so we
// don't end up with a litter of anonymously generated GraphQL types
const cachedTypes = {};

// Maps a Joi description to a GraphQL type. `isInput` is used to determine
// when to use, say, GraphQLInputObjectType vs. GraphQLObjectType—useful in
// cases such as args and mutations.
const descToType = (schema, isInput) => {
  const desc = schema && schema.describe ? schema.describe() : schema;
  const typeName = getTypeName(schema, isInput);
  const required = isInput && presence(desc, "required");
  const type = {
    boolean: () => GraphQLBoolean,
    date: () => GraphQLString,
    string: () => GraphQLString,
    number: () => {
      const isInteger = !!find(desc.rules, { name: "integer" });

      return isInteger ? GraphQLInt : GraphQLFloat;
    },
    object: () => {
      if (cachedTypes[typeName]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return cachedTypes[typeName];
      }
      let type;
      if (isInput) {
        type = new GraphQLInputObjectType({
          name: typeName,
          description: desc.description,
          fields: omitBy(
            mapValues(desc.children, (child, k) => {
              if (presence(child, "forbidden")) {
                return null;
              }
              const childSchema = get(
                schema._inner.children.filter((e) => e.key === k),
                "[0].schema",
              );
              return childSchema ? { type: descToType(childSchema, true) } : null;
            }),
            isNull,
          ),
        });
      } else {
        type = new GraphQLObjectType({
          name: typeName,
          description: desc.description,
          fields: descsToFields(mapValues(desc.children, (_child, k) => Joi.reach(schema, k))),
        });
      }
      cachedTypes[typeName] = type;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return type;
    },
    array: () => {
      let type;
      const items = schema._inner.items.filter((item) => !presence(item.describe(), "forbidden"));
      if (items.length === 1) {
        type = descToType(items[0], isInput);
      } else {
        type = makeArrayAlternativeType(cachedTypes, isInput, typeName, desc, items);
      }
      if (!cachedTypes[typeName]) {
        cachedTypes[typeName] = type;
      }

      return new GraphQLList(type);
    },
    alternatives: () => {
      let type;
      const alternatives = map(schema._inner.matches, "schema").filter((a) =>
        a ? !presence(a.describe(), "forbidden") : false,
      );

      if (alternatives.length === 0) {
        type = new GraphQLScalarType({
          name: "ANY",
          description: "Type ANY meaning allow whatever type",
          serialize(value) {
            return value;
          },
          parseValue(value) {
            return value;
          },
          parseLiteral(data: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return data.value;
          },
        });
      } else {
        type = makeArrayAlternativeType(cachedTypes, isInput, typeName, desc, alternatives);
      }
      if (!cachedTypes[typeName]) {
        cachedTypes[typeName] = type;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return type;
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    lazy: () => descToType(schema._flags.lazy(), isInput),
  }[desc.type]();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return required ? new GraphQLNonNull(type) : type;
};

const makeArrayAlternativeType = (cachedTypes, isInput, typeName, desc, items) => {
  const types = items.map((item) => descToType(item, isInput));
  if (cachedTypes[typeName]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cachedTypes[typeName];
  }
  if (isInput) {
    const children = fromPairs(
      flatten(items.map((item) => map(item._inner.children, (c) => [c.key, c.schema]))) as List<
        [PropertyName, unknown]
      >,
    );

    // Strip resolvers from generated types
    const fields: any = mapValues(descsToFields(children), (field) => {
      return omit(field, "resolve");
    });

    return new GraphQLInputObjectType({
      name: typeName,
      description: desc.description,
      fields,
    });
  }

  return new GraphQLUnionType({
    name: typeName,
    description: desc.description,
    types,
    resolveType: (val) =>
      find(
        map(items, (item, _i) => {
          try {
            return Joi.attempt(val, item);
          } catch (e) {}
        }),
      ),
  });
};

// Convert a Joi description's `meta({ args: {} })` to a GraphQL field's
// arguments
const descToArgs = (schema) => {
  const desc = schema.describe();
  const argsSchema = first(compact(map(desc.meta, "args")));

  return (
    argsSchema &&
    omitBy(
      mapValues(argsSchema, (schema) => {
        if (presence(schema.describe(), "forbidden")) {
          return null;
        }

        return {
          type: descToType(schema, true),
        };
      }),
      isNull,
    )
  );
};

// Wraps a resolve function specifid in a Joi schema to add validation.
const validatedResolve = (schema) => (source, args, context, opts) => {
  const desc = schema.describe();
  const resolve = desc.meta && first(compact(map(desc.meta, "resolve")));
  if (args && !isEmpty(args)) {
    const argsSchema = first(compact(map(desc.meta, "args")));
    const value = Joi.attempt(args, argsSchema);

    return resolve(source, value, context, opts);
  }
  if (resolve) {
    return resolve(source, args, context, opts);
  }

  return source && source[opts.fieldNodes[0].name.value];
};

// Convert a hash of descriptions into an object appropriate to put in a
// GraphQL.js `fields` key.
export const descsToFields = (schemas, _resolveMiddlewares = () => {}) =>
  omitBy(
    mapValues(schemas, (schema) => {
      const desc = schema && schema.describe ? schema.describe() : schema;
      const cleanSchema = clean(schema);
      if (presence(desc, "forbidden")) {
        return null;
      }

      return {
        type: descToType(cleanSchema, null),
        args: descToArgs(cleanSchema),
        description: desc.description || "",
        resolve: validatedResolve(cleanSchema),
      };
    }),
    isNull,
  );

export const mapJoiToGQL: any = (schemas) => {
  const result = schemas
    .map((schema) => {
      const desc = schema && schema.describe ? schema.describe() : schema;
      const cleanSchema = clean(schema);
      if (presence(desc, "forbidden")) {
        return null;
      }

      return descToType(cleanSchema, true);
    })
    .filter((e) => (e.ofType ? false : true));

  const cachedTypeUnique = uniqBy(
    Object.keys(cachedTypes)
      .reduce((a, b) => a.concat(cachedTypes[b]), [])
      .map((e) => {
        return {
          name: e.name,
          type: e,
        };
      })
      .filter((e) => e.name),
    (e) => e.name,
  ).map((e) => e.type);

  return uniq(result.concat(cachedTypeUnique));
};

export function mappingTypeName(schema: any, typeName: any) {
  // if (getTypeNameFromSchema(schema)) {
  schema._typeName = typeName;
  return schema;
  // }
  // return schema;
}

export function getTypeNameFromSchema(schema: any) {
  if (schema._typeName) {
    return schema._typeName;
  }

  const desc = schema.describe();
  return first(compact(map(desc.meta, "typeName")));
}

const clean = (schema) => {
  const desc = schema.describe();
  switch (desc.type) {
    case "lazy":
      return clean(schema._flags.lazy());
  }

  return schema;
};

const getTypeName = (schema, isInput) => {
  const desc = schema.describe();
  let typeName = schema._typeName;

  if (!typeName) {
    /* tslint:disable */
    switch (desc.type) {
      case "array":
        const items = schema._inner.items.filter((item) => !presence(item.describe(), "forbidden"));
        if (items.length > 1) {
          typeName = map(items, (d) => {
            const name = (d.meta && capitalize(d.meta.name)) || capitalize(d.type) || "Anon" + uniqueId();

            return (isInput ? "Input" : "") + name;
          }).join("Or");
        }
        break;
    }
    /* tslint:enable */

    if (!typeName) {
      typeName = (isInput ? "Input" : "") + (first(compact(map(desc.meta, "name"))) || "Anon" + uniqueId());
    }

    schema._meta.push({ typeName });
  }

  return typeName;
};
