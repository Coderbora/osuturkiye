const router = require("express-promise-router")();
const Logger = require("../../../Logger.js");
const { isDatabaseAvailable } = require("../../../middlewares.js");


let logger = Logger.get("UserRouter");


router.get("/", isDatabaseAvailable, async (req, res) => {
    res.json({
        error: false,
        user: (req.user) ? await req.user.getInfos() : null,
      });
});

module.exports = router;