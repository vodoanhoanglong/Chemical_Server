import { Router } from "shared";

const router: Router = Router();

router.get("/edrv/hook", (_, res) => res.status(200).send("OK"));

export { router };
