const router = require("express-promise-router")();
const passport = require("passport");
const { ErrorCode } = require("../../../../models/ErrorCodes.js");
const { isDatabaseAvailable } = require("../../../../middlewares.js");


router.get("/", isDatabaseAvailable, passport.authenticate("osu", { scope: ["identify"] }));

router.get("/callback", isDatabaseAvailable, passport.authenticate("osu", { failureRedirect: "/" }) , (req, res) => {
    if (!req.query.code || req.query.error)
        throw ErrorCode.MISSING_PARAMETERS;
        
    res.redirect("/");
});



module.exports = router;