const router = require("express-promise-router")();

router.get("/", (req, res) => {
    res.send("Hello world from API!");
})

router.use("*", (req, res) => {
    res.status(404).send("404 - Not Found")
})

module.exports = router;