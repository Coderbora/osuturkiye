import promiseRouter from "express-promise-router";
import { isDatabaseAvailable } from "../../../middlewares.js";
import { IAppRequest } from "../../../models/IAppRequest";

export class UserRouter {
	public readonly router = promiseRouter();

	constructor() {
		this.router.get("/", isDatabaseAvailable, async (req: IAppRequest, res) => {
			res.json({
				error: false,
				user: (req.user) ? await req.user.getInfos() : null,
			  });
		});
	}
}