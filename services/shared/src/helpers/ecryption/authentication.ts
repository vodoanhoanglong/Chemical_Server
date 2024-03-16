import crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { get } from "lodash";
import md5 from "md5";
import { StatusCode, SystemUser } from "../../models";
import { ErrorKey } from "../../resources";
import { Platform } from "../../types";
import { isUUID } from "../data";

export const TOKEN_EXPIRED_ERROR = "TokenExpiredError";
export const JSON_WEB_TOKEN_ERROR = "JsonWebTokenError";

export interface ITokenPayload {
  id: string;
  key: string;
  errorCode: string;
}

/**
 * DESC: return decode data of token.
 *
 * @export
 * @param {string} token
 * @param {string} secretKey
 * @return {Promise<object>}
 */
export async function validateToken(token: string, secretKey: string): Promise<Partial<ITokenPayload>> {
  return new Promise((resolve) => {
    return jwt.verify(token, secretKey, null, (error, decoded) => {
      if (error) {
        return resolve({
          errorCode: get(error, "name", JSON_WEB_TOKEN_ERROR),
        });
      }

      return resolve({ id: decoded["id"], key: decoded["key"] });
    });
  });
}

export function getToken(user: SystemUser) {
  const tokenPayLoad = {
    id: user.id,
    key: hashHmacSha256(user.id),
  };

  const secretKey = user instanceof SystemUser ? process.env.JWT_SYSTEM_SECRET_KEY : process.env.JWT_SECRET_KEY;

  return jwt.sign(tokenPayLoad, secretKey, {
    expiresIn: "7d",
  });
}

/**
 * DESC: hash key with secret key.
 * To check the integrity of key.
 * @param key
 */
export function hashHmacSha256(key: string) {
  return crypto.createHmac("sha256", process.env.HASH_SECRET_KEY).update(key).digest("hex");
}

/**
 * DESC: return refresh token.
 *
 * @export
 * @param {(SystemUser)} user - user or customer.
 * @return {refreshToken} - return object of token and refreshToken.
 */
export function getRefreshToken(user: SystemUser, token: string) {
  const tokenPayLoad = {
    id: user.id,
    key: hashHmacSha256(user.id),
  };

  // refresh t
  const secretKey =
    user instanceof SystemUser
      ? getSecretKey(process.env.JWT_SYSTEM_SECRET_KEY, token)
      : getSecretKey(process.env.JWT_SECRET_KEY, token);

  return jwt.sign(tokenPayLoad, secretKey);
}

/**
 * DESC: return decoded data of refresh token.
 *
 * @export
 * @param refreshToken
 * @param secretKey
 * @param token
 * @return {Promise<object>}
 */
export async function validateRefreshToken(
  refreshToken: string,
  secretKey: string,
  token: string,
): Promise<Partial<ITokenPayload>> {
  const decryptedSecret = getSecretKey(secretKey, token);

  return new Promise((resolve) => {
    return jwt.verify(refreshToken, decryptedSecret, null, (error, decoded) => {
      if (error) {
        return resolve({
          errorCode: get(error, "name", JSON_WEB_TOKEN_ERROR),
        });
      }

      return resolve({ id: decoded["id"], key: decoded["key"] });
    });
  });
}

/**
 * DESC: get secret key for refresh token base on user id.
 * @param secret
 * @param token
 */
function getSecretKey(secret: string, token: string) {
  return secret.substring(0, 24) + md5(token).substring(0, 8);
}

export async function authorize(token: string, platform: Platform, refreshToken = null) {
  try {
    let userInfo = {} as SystemUser;
    let secretKey = "";
    let tokenInfo = {} as Partial<ITokenPayload>;

    if (platform === Platform.App) {
      secretKey = process.env.JWT_SECRET_KEY;
      tokenInfo = refreshToken
        ? await validateRefreshToken(refreshToken, secretKey, token)
        : await validateToken(token, secretKey);
      // userInfo = await Customer.findOne({
      //   where: {
      //     id: isUUID(token) ? token : get(tokenInfo, "id", null),
      //     status: StatusCode.Active,
      //   },
      // });
    } else {
      secretKey = process.env.JWT_SYSTEM_SECRET_KEY;
      tokenInfo = refreshToken
        ? await validateRefreshToken(refreshToken, secretKey, token)
        : await validateToken(token, secretKey);
      userInfo = await SystemUser.findOne({
        where: {
          id: isUUID(token) ? token : get(tokenInfo, "id", null),
          status: StatusCode.Active,
        },
      });
    }

    if (tokenInfo.errorCode === TOKEN_EXPIRED_ERROR) return Promise.reject(ErrorKey.TokenExpired);

    if (tokenInfo.errorCode === JSON_WEB_TOKEN_ERROR) return Promise.reject(ErrorKey.InvalidToken);

    if (!userInfo) return Promise.reject(ErrorKey.CurrentUserNotFound);

    return userInfo;
  } catch (error) {
    return Promise.reject(error);
  }
}
