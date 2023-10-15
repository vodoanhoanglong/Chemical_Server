import Joi from "@hapi/joi";
import {
  ErrorKey,
  IAction,
  IHandler,
  Platform,
  Role,
  SystemUser,
  authorize,
  getRefreshToken,
  getToken,
  hasUniqueError,
  hashPassword,
  verifyPassword,
} from "shared";
import { FormRefreshToken, FormSignIn, FormSignUp } from "./schema";

export const signUp: IHandler<IAction<Joi.extractType<typeof FormSignUp>>> = async ({ payload }) => {
  try {
    const hashedPassword = await hashPassword(payload.form.password);

    const user = await SystemUser.create({
      password: hashedPassword,
      email: payload.form.email,
      fullName: payload.form.fullName,
      role: Role.Moderator,
    });

    const token = await getToken(user);
    const refreshToken = getRefreshToken(user, token);

    return {
      token,
      refreshToken,
    };
  } catch (error) {
    if (hasUniqueError(error, ["phoneNumber"])) {
      return Promise.reject(ErrorKey.PhoneExisted);
    }
    if (hasUniqueError(error, ["email"])) {
      return Promise.reject(ErrorKey.EmailExisted);
    }

    return Promise.reject(error);
  }
};

export const signIn: IHandler<IAction<Joi.extractType<typeof FormSignIn>>> = async ({ payload }) => {
  try {
    const user = await SystemUser.findOne({
      attributes: ["id", "password"],
      where: {
        email: payload.form.email.toLowerCase(),
      },
    });

    if (!user) return Promise.reject(ErrorKey.InvalidEmailOrPassword);

    if (!(await verifyPassword(payload.form.password, user.password)))
      return Promise.reject(ErrorKey.InvalidEmailOrPassword);

    const token = await getToken(user);
    const refreshToken = getRefreshToken(user, token);

    return {
      token,
      refreshToken,
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

export const refreshToken: IHandler<IAction<Joi.extractType<typeof FormRefreshToken>>> = async ({ payload, req }) => {
  try {
    const userInfo = await authorize(payload.form.token, req.headers.platform as Platform, payload.form.refreshToken);

    const newToken = await getToken(userInfo);

    return {
      token: newToken,
      refreshToken: getRefreshToken(userInfo, newToken),
    };
  } catch (error) {
    return Promise.reject(error);
  }
};
