import * as crypto from "crypto";

/**
 * DESC: hash password with salt 10
 *
 * @param {string} passwordString
 *
 * @returns {Promise<string>} passwordHashed = salt + derivedKey
 */
export function hashPassword(passwordString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(8).toString("hex");

    crypto.scrypt(passwordString, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(salt + derivedKey.toString("hex"));
    });
  });
}

/**
 * DESC: verify password with passwordString and passwordHashed
 *
 * @param {string} passwordString
 * @param {string} passwordHashed
 *
 * @returns {Promise<boolean>} compare result
 */
export function verifyPassword(passwordString: string, passwordHashed: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const salt = passwordHashed.substr(0, 16);
    const key = passwordHashed.substr(16, passwordHashed.length);

    crypto.scrypt(passwordString, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(key === derivedKey.toString("hex"));
    });
  });
}
