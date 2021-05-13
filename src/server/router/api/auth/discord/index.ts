import promiseRouter from "express-promise-router";
import passport from "passport";
import { DiscordAPIError } from "discord.js";

import { Logger } from "../../../../Logger";
import { App } from "../../../../App";
import { isDatabaseAvailable, isAuthenticated } from "../../../../middlewares";
import { ErrorCode } from "../../../../models/ErrorCodes";
import { IAppRequest } from "../../../../models/IAppRequest";


const logger = Logger.get("AuthDiscordRouter");

export class DiscordAuthRouter {
    public readonly router = promiseRouter();

    constructor() {
        this.router.get("/", isDatabaseAvailable, isAuthenticated, passport.authenticate("discord", { scope: ['identify', 'guilds.join'] }));

        this.router.get("/callback", isDatabaseAvailable, isAuthenticated, passport.authenticate("discord", { failureRedirect: "/" }) , async (req: IAppRequest, res) => {
            
            const discordMember = await App.instance.discordClient.fetchMember(req.user.discord?.userId, true);
            
            if (!discordMember) {
                try {
                    await App.instance.discordClient.discordGuild?.addMember(req.user.discord?.userId, {
                        accessToken: req.user.discord?.accessToken,
                        nick: req.user.osu?.username,
                        roles: [App.instance.config.discord.roles.verifiedRole]
                    });
                } catch(err) {
                    if (err instanceof DiscordAPIError && err.code === 40007)
                        throw ErrorCode.BANNED;
                    else if(!(err instanceof DiscordAPIError && err.code === 30001))
                        throw err;
                }
            }

            await req.user.osu?.fetchUser();
            await req.user.discord?.updateUser();
            logger.log("success",`**[${req.user.getUsername()}](https://osu.ppy.sh/users/${req.user.osu.userId})** \`Discord ID: ${req.user.discord.userId}\` has **linked** their Discord account.`);
            res.redirect("/");
        });

        this.router.get("/delink", isDatabaseAvailable, isAuthenticated, async (req: IAppRequest, res) => {
            if(req.user?.discord && !req.user.discord.availableDelinkDate()) { 
                await req.user.discord.delink();
                req.user.discord = undefined;
                await req.user.save();
                return res.json({ error: false });
            } else {
                throw ErrorCode.FORBIDDEN;
            }
        })
    }
}