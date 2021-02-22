const router = require("express-promise-router")();
const passport = require("passport");
const Logger = require("../../../../Logger.js");
const config = require('../../../../../../config.json');
const { ErrorCode } = require("../../../../models/ErrorCodes.js");
const { isDatabaseAvailable } = require("../../../../middlewares.js");
const { User } = require("../../../../models/User.js");

let logger = Logger.get("AuthOsuRouter");


router.get("/", isDatabaseAvailable, passport.authenticate("osu", { scope: ["identify"] }));

router.get("/callback", isDatabaseAvailable, passport.authenticate("osu", { failureRedirect: "/" }) , (req, res) => {
    if (!req.query.code || req.query.error)
        throw ErrorCode.MISSING_PARAMETERS;
        
    res.redirect("/");
});



module.exports = router;