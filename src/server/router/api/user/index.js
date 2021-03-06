const router = require("express-promise-router")();
const { isDatabaseAvailable } = require("../../../middlewares.js");

router.get("/", isDatabaseAvailable, async (req, res) => {
    res.json({
        error: false,
        user: (req.user) ? await req.user.getInfos() : null,
      });
});

module.exports = router;