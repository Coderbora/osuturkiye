import promiseRouter from "express-promise-router";
import { OsuAuthRouter } from "./osu/index";
import { DiscordAuthRouter } from "./discord/index";
import { isAuthenticated } from "../../../middlewares";

export class AuthRouter {
    public readonly router = promiseRouter();

    constructor() {
        this.router.use("/osu", (new OsuAuthRouter).router)
        this.router.use("/discord", (new DiscordAuthRouter).router)

        this.router.get("/logout", isAuthenticated, (req, res) => {
            req.session.destroy(() => {});
            req.logout();
            res.json({ error: false });
        });
    }
}