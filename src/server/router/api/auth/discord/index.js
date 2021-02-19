const router = require("express-promise-router")();
const Logger = require("../../../../Logger.js");
const { isDatabaseAvailable } = require("../../../../middlewares.js");


let logger = Logger.get("AuthDiscordRouter");


router.get("/", isDatabaseAvailable, (req, res) => {
});

router.get("/callback", isDatabaseAvailable, (req, res) => {
});



module.exports = router;