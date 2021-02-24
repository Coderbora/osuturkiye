const router = require("express-promise-router")();
const osuRouter = require("./osu/index.js");
const discordRouter = require("./discord/index.js");

router.use("/osu", osuRouter)
router.use("/discord", discordRouter)

module.exports = router;