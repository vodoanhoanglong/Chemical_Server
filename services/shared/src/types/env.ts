export enum NodeEnv {
  Local = "local",
  Develop = "develop",
  Staging = "staging",
  Production = "production",
}

export function isLocalEnv() {
  return process.env.NODE_ENV === NodeEnv.Local;
}
