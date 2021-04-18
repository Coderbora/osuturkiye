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
            
            let discordMember = await App.instance.discordClient.fetchMember(req.user.discord.userId, true);
            
            if (!discordMember) {
                try {
                    await App.instance.discordClient.discordGuild.addMember(req.user.discord.userId, {
                        accessToken: req.user.discord.accessToken,
                        nick: req.user.osu.username,
                        roles: [App.instance.config.discord.roles.verifiedRole]
                    });
                } catch(err) {
                    if(!(err instanceof DiscordAPIError && err.code === 30001))
                        throw err;
                }
            }

            await req.user.osu.fetchUser();
            await req.user.discord.updateUser();
            
            res.redirect("/");
        });

        this.router.get("/delink", isDatabaseAvailable, isAuthenticated, async (req: IAppRequest, res) => {
            if(Date.now() - req.user.discord.dateAdded.getTime() > 86400000) { 
                const osuID = req.user.osu.userId;
                const discordID = req.user.discord.userId;
            

                await req.user.discord.delink();
                req.user.discord = undefined;
                await req.user.save();

                logger.info(`**${req.user.getUsername()}** \`osu ID: ${osuID}\` \`Discord ID: ${discordID}\` has delinked their Discord account.`);
                return res.json({ error: false });
            } else {
                throw ErrorCode.FORBIDDEN;
            }
        })
    }
}