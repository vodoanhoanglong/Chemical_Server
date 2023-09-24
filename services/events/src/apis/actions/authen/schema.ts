import Joi from "@hapi/joi";

export const FormSignUp = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
  password: Joi.string().required(),
}).meta({ typeName: "FormSignUp" });

export const FormSignIn = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const FormRefreshToken = Joi.object({
  token: Joi.string().required(),
  refreshToken: Joi.string().required(),
});
