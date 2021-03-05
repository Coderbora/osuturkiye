const router = require("express-promise-router")();
const osuRouter = require("./osu/index.js");
const discordRouter = require("./discord/index.js");
const { isAuthenticated } = require("../../../middlewares.js");

router.use("/osu", osuRouter)
router.use("/discord", discordRouter)

router.get("/logout", isAuthenticated, (req, res) => {
    req.session.destroy(null);
    req.logout();
    res.json({ error: false });
});


module.exports = router;