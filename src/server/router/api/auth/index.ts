import promiseRouter from "express-promise-router";
import { OsuAuthRouter } from "./osu/index";
import { DiscordAuthRouter } from "./discord/index";
import { isAuthenticated } from "../../../middlewares";
import { Logger } from "../../../Logger";

export class AuthRouter {
    public readonly router = promiseRouter();

    constructor() {
        const logger = Logger.get("AuthRouter")

        this.router.use("/osu", (new OsuAuthRouter).router)
        this.router.use("/discord", (new DiscordAuthRouter).router)

        this.router.get("/logout", isAuthenticated, (req, res) => {
            req.session.destroy((err) => {
                if(err) logger.error(err);
            });
            req.logout();
            res.json({ error: false });
        });
    }
}