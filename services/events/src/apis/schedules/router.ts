import { Router, wrapperHandler } from "shared";

const router: Router = Router();

export const enum PathScheduledEvent {
  Notification = "/schedules/notification",
}

const handlers = [

];

handlers.map((handler) =>
  router.post(
    handler.path,
    wrapperHandler(
      handlers.map((item) => item.handlerName),
      (body) => {
        return {
          name: handler.handlerName.name,
          data: body,
        };
      },
    ),
  ),
);

export { router };

