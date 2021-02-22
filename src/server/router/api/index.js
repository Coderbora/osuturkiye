const router = require("express-promise-router")();
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const connectMongo = require("connect-mongo");

const DiscordStrategy = require("passport-discord").Strategy;
const OsuStrategy = require('passport-osu').default;

const Logger = require("../../Logger.js");
const { User } = require("../../models/User");

const authRouter = require("./auth/index.js");
const userRouter = require("./user/index.js");

const { isDatabaseAvailable } = require("../../middlewares.js")
const config = require("../../../../config.json");

router.use("/", isDatabaseAvailable);

const MongoStore = connectMongo(session);
router.use(session({
    secret: config.session.secret,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
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
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ "discord.userId": profile.id });
        if(user)
            user.lastLogin = user.discord.lastVerified = new Date();
        else
            user = new User({
                discord: {
                    userId: profile.id,
                },
            });

        user.discord.accessToken = accessToken;
        user.discord.refreshToken = refreshToken;
        await user.save();
        done(null, user);
    } catch(error) {
        passportLogger.error("Error while authenticating user via Discord", { error });
        done(error);
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
            user.lastLogin = user.osu.lastVerified = new Date();
        else
            user = new User({
                osu: {
                    userId: profile.id
                },
            });

        user.osu.playmode = profile.playmode;
        user.osu.username = profile.username;

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
    res.status(404).send("404 - Not Found")
})

module.exports = router;