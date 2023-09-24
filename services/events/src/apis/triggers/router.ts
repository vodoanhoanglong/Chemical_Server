import { parseSessionVariable, Router, wrapperHandler } from "shared";
const router: Router = Router();
const handlers = [];

router.post(
  "/triggers",
  wrapperHandler(handlers, (body) => {
    return {
      name: body?.trigger?.name,
      data: body?.event?.data,
      op: body?.event?.op,
      sessionVariables: parseSessionVariable(body?.event?.session_variables),
    };
  }),
);

export { router };
