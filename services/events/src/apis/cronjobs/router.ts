import { Router, wrapperHandler } from "shared";

const router: Router = Router();
const handlers = [];

router.post(
  "/cronjobs",
  wrapperHandler(handlers, (body) => {
    return {
      name: body?.name,
      data: body,
    };
  }),
);

export { router };
