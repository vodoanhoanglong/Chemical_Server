import Joi from "@hapi/joi";
import { ErrorKey, IAction, IHandler, Platform, authorize, getRefreshToken, getToken, hasUniqueError } from "shared";
import { FormRefreshToken, FormSignIn, FormSignUp } from "./schema";

export const signUp: IHandler<IAction<Joi.extractType<typeof FormSignUp>>> = async ({ payload }) => {
  try {
    // const hashedPassword = await hashPassword(payload.form.password);

    // const customer = await Customer.create({
    //   password: hashedPassword,
    //   email: payload.form.email,
    //   fullName: payload.form.fullName,
    //   role: Role.Customer,
    //   ethData: resEthAccount,
    // });

    // const token = await getToken(customer);
    // const refreshToken = getRefreshToken(customer, token);

    return {
      token: null,
      refreshToken: null,
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
    // const customer = await Customer.findOne({
    //   attributes: ["id", "password"],
    //   where: {
    //     email: payload.form.email,
    //   },
    // });

    // if (!customer) return Promise.reject(ErrorKey.InvalidEmailOrPassword);

    // const hashedPassword = await hashPassword(payload.form.password);

    // if (!verifyPassword(customer.password, hashedPassword)) return Promise.reject(ErrorKey.InvalidEmailOrPassword);

    // const token = await getToken(customer);
    // const refreshToken = getRefreshToken(customer, token);

    return {
      token: null,
      refreshToken: null,
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
