const router = require("express-promise-router")();
const authRouter = require("./auth/index.js");

router.use("/auth", authRouter);

router.get("/", (req, res) => {
    res.send("Hello world from API!");
})

router.use("*", (req, res) => {
    res.status(404).send("404 - Not Found")
})

module.exports = router;