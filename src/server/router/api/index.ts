import promiseRouter from "express-promise-router";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import { DateTime } from "luxon";

import DiscordStrategy from "passport-discord";
import OsuStrategy from 'passport-osu';

import { Logger } from "../../Logger";
import { User, IDiscordInformation } from "../../models/User";
import { ErrorCode } from "../../models/ErrorCodes";
import { IAppRequest } from "../../models/IAppRequest";

import { AuthRouter } from "./auth/index";
import { UserRouter } from "./user/index";

import { isDatabaseAvailable } from "../../middlewares";
import { App } from "../../App";

export class ApiRouter {
    public readonly router = promiseRouter();

    constructor() {
        this.router.use("/", isDatabaseAvailable, (req: IAppRequest, res, next) => {
            req.api = true;
            next();
        }); 
        
        this.router.use(session({
            secret: App.instance.config.session.secret,
            store: MongoStore.create({ mongoUrl: App.instance.config.mongo.uri }),
            cookie: {
                maxAge: 7*24*60*60*1000
            },
            saveUninitialized: false,
            resave: false
        }));
        
        const passportLogger = Logger.get("passport");
        
        passport.use('discord', new DiscordStrategy({
            clientID: App.instance.config.discord.clientId,
            clientSecret: App.instance.config.discord.clientSecret,
            callbackURL: App.instance.config.http.publicUrl + "/api/auth/discord/callback",
            passReqToCallback: true
        }, async (req: IAppRequest, accessToken, refreshToken, profile, done) => {
            if(req.user) {
                try {
                    if(!req.user.discord) {
                        req.user.discord = {} as IDiscordInformation;
                        req.user.discord.userId = profile.id;
                    }
                    
                    if(req.user.discord.userId !== profile.id) {
                        passportLogger.warn(`User **[${req.user.getUsername()}](https://osu.ppy.sh/users/${req.user.osu.userId})** tried to reclaim another Discord account (ID: \`${profile.id}\`, Name: \`${profile.username}#${profile.discriminator}\`)`)
                        done(ErrorCode.ALREADY_AUTHENTICATED as Error);
                    } else {
                        req.user.discord.userNameWithDiscriminator = `${profile.username}#${profile.discriminator}`;
                        req.user.discord.accessToken = accessToken;
                        req.user.discord.refreshToken = refreshToken;
                        await req.user.save();
                        done(null, req.user);
                    }
                } catch(error) {
                    passportLogger.error("Error while authenticating user via Discord", { error });
                    done(error);
                }
            }
        }));
        
        passport.use("osu", new OsuStrategy({
            type: "StrategyOptions",
            clientID: App.instance.config.osu.clientId,
            clientSecret: App.instance.config.osu.clientSecret,
            callbackURL: App.instance.config.http.publicUrl + "/api/auth/osu/callback",
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                if (profile._json.is_restricted) {
                    passportLogger.warn(`User **[${profile._json.username}](https://osu.ppy.sh/users/${profile.id})** tried to login with restricted account.`);
                    done(ErrorCode.BANNED as Error);
                }
                
                let user = await User.findOne({ "osu.userId": profile.id });
                if(user)
                    user.lastLogin = DateTime.now().setZone(App.instance.config.misc.timezone).toJSDate();
                else
                    user = new User({
                        osu: {
                            userId: profile.id,
                            lastVerified: DateTime.now().setZone(App.instance.config.misc.timezone).toJSDate()
                        },
                    });
        
                user.osu.playmode = profile._json.playmode;
                user.osu.username = profile._json.username;
        
                user.osu.accessToken = accessToken;
                user.osu.refreshToken = refreshToken;
                await user.save();
                done(null, user);
            } catch(error) {
                passportLogger.error("Error while authenticating user via osu!", { error });
                done(error);
            }
        }));
        
        passport.serializeUser(User.serializeUser);
        passport.deserializeUser(User.deserializeUser);
        this.router.use(passport.initialize());
        this.router.use(passport.session());
        
        
        this.router.use("/auth", (new AuthRouter).router);
        this.router.use("/user", (new UserRouter()).router);
        
        this.router.use("*", (req, res) => {
            res.status(404).json({ error: ErrorCode.NOT_FOUND })
        })
    }

}