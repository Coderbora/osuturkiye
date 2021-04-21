const router = require("express-promise-router")();
const session = require("express-session");
const passport = require("passport");
const MongoStore  = require("connect-mongo").default;

const DiscordStrategy = require("passport-discord").Strategy;
const OsuStrategy = require('passport-osu').default;

const Logger = require("../../Logger.js");
const { User } = require("../../models/User");
const ErrorCode = require("../../models/ErrorCodes.js");

const authRouter = require("./auth/index.js");
const userRouter = require("./user/index.js");

const { isDatabaseAvailable } = require("../../middlewares.js")
const config = require("../../../../config.json");

router.use("/", isDatabaseAvailable, (req, res, next) => {
    req.api = true;
    next();
}); 

router.use(session({
    secret: config.session.secret,
    store: MongoStore.create({ mongoUrl: config.mongo.uri }),
    cookie: {
        maxAge: 7*24*60*60*1000
    },
    saveUninitialized: false,
    resave: false
}));

passportLogger = Logger.get("passport");

passport.use('discord', new DiscordStrategy({
    clientID: config.discord.clientId,
    clientSecret: config.discord.clientSecret,
    callbackURL: config.http.publicUrl + "/api/auth/discord/callback",
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    if(req.user) {
        try {
            if(!req.user.discord) {
                req.user.discord = { userId: profile.id };
            }
            if(req.user.discord.userId !== profile.id) {
                passportLogger.warn(`User **[${req.user.getUsername()}](https://osu.ppy.sh/users/${req.user.osu.userId})** tried to reclaim another Discord account (ID: \`${profile.id}\`, Name: \`${profile.username}#${profile.discriminator}\`)`)
                done(ErrorCode.ALREADY_AUTHENTICATED);
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
    clientID: config.osu.clientId,
    clientSecret: config.osu.clientSecret,
    callbackURL: config.http.publicUrl + "/api/auth/osu/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ "osu.userId": profile.id });
        if(user)
            user.lastLogin = new Date();
        else
            user = new User({
                osu: {
                    userId: profile.id,
                    lastVerified: new Date()
                },
            });

        user.osu.playmode = profile._json.playmode;
        user.osu.username = profile._json.username;

        user.osu.accessToken = accessToken;
        user.osu.refreshToken = refreshToken;
        await user.save();
        done(null, user);
    } catch(error) {
        passportLogger.error("Error while authenticating user via Osu", { error });
        done(error);
    }
}));



passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);
router.use(passport.initialize());
router.use(passport.session());


router.use("/auth", authRouter);
router.use("/user", userRouter);

router.use("*", (req, res) => {
    res.status(404).json({ error: ErrorCode.NOT_FOUND })
})

module.exports = router;