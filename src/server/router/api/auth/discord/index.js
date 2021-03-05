const router = require("express-promise-router")();
const passport = require("passport");
const { DiscordAPIError } = require("discord.js");

const Logger = require("../../../../Logger.js");
const DiscordClient = require("../../../../DiscordClient.js")();
const config = require("../../../../../../config.json");
const { isDatabaseAvailable, isAuthenticated } = require("../../../../middlewares.js");


let logger = Logger.get("AuthDiscordRouter");


router.get("/", isDatabaseAvailable, isAuthenticated, passport.authenticate("discord", { scope: ['identify', 'guilds.join'] }));

router.get("/callback", isDatabaseAvailable, isAuthenticated, passport.authenticate("discord", { failureRedirect: "/" }) , async (req, res) => {
    
    let discordMember = DiscordClient.fetchMember(req.user.discord.userId);
    
    if (!discordMember) {
        try {
            await DiscordClient.discordGuild.addMember(req.user.discord.userId, {
                accessToken: req.user.discord.accessToken,
                nick: req.user.osu.username,
                roles: [config.discord.roles.verifiedRole]
            });
        } catch(err) {
            if(!(err instanceof DiscordAPIError && err.code === 30001))
                throw err;
        }
    } else {
        await Promise.all([
            discordMember.roles.add(config.discord.roles.verifiedRole),
            discordMember.setNickname(req.user.osu.username),
        ]);
    }

    await Promise.all([
        req.user.osu.fetchUser(),
        req.user.discord.updateUser()
    ])
    
    res.redirect("/");
});



module.exports = router;