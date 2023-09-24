import "joi-extract-type";
import { isEqual, isObject, pickBy, transform } from "lodash";

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export function differenceDeep<I>(object: I, base: I) {
  return transform(object as unknown[], (result, value, key) => {
    if (!isEqual(value, base[key])) {
      result[key] = isObject(value) && isObject(base[key]) ? differenceDeep(value, base[key]) : value;
    }
  });
}

export function safeParseInt(input: string | number, defaultValue: number = null): number {
  if (!input || typeof input === "number") {
    return Math.floor(<number>input || defaultValue);
  }

  try {
    return parseInt(input, 0);
  } catch {
    return defaultValue;
  }
}

export function skipValueObject<I extends Record<string, unknown>>(input: I, valueSkip = [null, undefined]): I {
  return pickBy(
    input,
    (v) => !valueSkip.filter((e) => (v !== null && typeof v === "object" ? isEqual(v, e) : e === v)).length,
  ) as I;
}

export function safeParseJSON<T = unknown>(input: string | T, defaultValue = {}): T {
  try {
    return (typeof input === "string" ? JSON.parse(input) : input ? input : defaultValue) as T;
  } catch (e) {
    return <T>defaultValue;
  }
}

export function isUUID(text) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/g.test(text) ? true : false;
}
