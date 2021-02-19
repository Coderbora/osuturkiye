const router = require("express-promise-router")();
const osuRouter = require("./osu/index.js");

router.use("/osu", osuRouter)

module.exports = router;