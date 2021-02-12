const express = require("express");
const router = require("express-promise-router")();
const apiRouter = require("./api/index.js");

router.use("/api", apiRouter);

router.use("/", express.static("build/client"));
router.use("*", express.static("build/client/index.html"));

module.exports = router;

