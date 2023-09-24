import Joi from "@hapi/joi";
import {
  HasuraHeader,
  IRequest,
  Platform,
  Response,
  Role,
  Router,
  authorize,
  responseError,
  validateHeader,
} from "shared";
const router: Router = Router();

const headerSchema = Joi.object({
  authorization: Joi.string().allow(null, ""),
});

router.get(
  "/auth/verify",
  validateHeader(headerSchema, {
    stripUnknown: true,
  }),
  async (req: IRequest, res: Response) => {
    try {
      const headers = req.headers as Joi.extractType<typeof headerSchema>;
      const token: string = headers.authorization;

      if (!token)
        return res.json({
          [HasuraHeader.Role]: Role.Anonymous,
        });

      if (token === process.env.GUEST_TOKEN)
        return res.json({
          [HasuraHeader.Role]: Role.Guest,
        });

      const currentUser = await authorize(token, Platform.Portal);

      if (!currentUser)
        return res.json({
          [HasuraHeader.Role]: Role.Anonymous,
        });

      return res.json({
        [HasuraHeader.Role]: currentUser.role,
        [HasuraHeader.UserId]: currentUser.id,
      });
    } catch (error) {
      return responseError(req, res, error, {
        statusCode: 401,
      });
    }
  },
);

export { router };
