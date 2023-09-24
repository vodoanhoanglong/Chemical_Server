import { IHandler, IHasuraAction, parseSessionVariable, Router, wrapperHandler } from "shared";
import { signIn, signUp } from "./authen";
const router: Router = Router();
const handlers = [signIn, signUp];

router.post(
  "/actions",
  wrapperHandler(handlers as IHandler[], (body: IHasuraAction) => {
    return {
      name: body?.action.name,
      data: body?.input,
      sessionVariables: parseSessionVariable(body?.session_variables),
    };
  }),
);

export { router };
