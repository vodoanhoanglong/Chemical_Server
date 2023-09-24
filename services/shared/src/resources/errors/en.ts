import { ErrorKey } from "./type";

export default {
  [ErrorKey.PermissionDenied]: "You do not have permission to access this resource",
  [ErrorKey.InvalidEmailOrPassword]: "Invalid email or password",
} as Record<ErrorKey, string>;
