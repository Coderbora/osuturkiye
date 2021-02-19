const router = require("express-promise-router")();
const Logger = require("../../../../Logger.js");
const config = require('../../../../../../config.json');
const osuApiV2 = require("../../../../OsuApiV2.js");
const { ErrorCode } = require("../../../../models/ErrorCodes.js");
const { isDatabaseAvailable } = require("../../../../middlewares.js");


let logger = Logger.get("AuthOsuRouter");
const redirect = config.http.publicUrl + "/api/auth/osu/callback";
const scope = "identify";


router.get("/", isDatabaseAvailable, (req, res) => {
    res.redirect(osuApiV2().getAuthorizationCodeInstance().authorizeURL({
        redirect_uri: redirect,
        scope: scope,
    }));
});

router.get("/callback", isDatabaseAvailable, (req, res) => {
    if (!req.query.code || req.query.error)
        throw ErrorCode.MISSING_PARAMETERS;

    
});



module.exports = router;