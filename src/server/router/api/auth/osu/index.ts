import promiseRouter from "express-promise-router";
import passport from "passport";
import { ErrorCode } from "../../../../models/ErrorCodes.js";
import { isDatabaseAvailable } from "../../../../middlewares.js";
import { IAppRequest } from "../../../../models/IAppRequest.js";

export class OsuAuthRouter {
    public readonly router = promiseRouter();

    constructor() {
        this.router.get("/", isDatabaseAvailable, passport.authenticate("osu", { scope: ["identify"] }));

        this.router.get("/callback", isDatabaseAvailable, passport.authenticate("osu", { failureRedirect: "/" }) , async (req: IAppRequest, res) => {
            if (!req.query.code || req.query.error)
                throw ErrorCode.MISSING_PARAMETERS;
            
            const publicReachable = await req.user.osu.tryFetchUserPublic();
            const globalRank = req.user.osu.rank;
            if (!publicReachable)
                throw ErrorCode.BANNED;
            if (globalRank > 2000000)
                throw ErrorCode.LOW_RANK;

            res.redirect("/");
        });
    }
}