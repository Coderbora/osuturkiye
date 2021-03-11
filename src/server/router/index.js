const express = require("express");
const router = require("express-promise-router")();
const apiRouter = require("./api/index.js");
const ErrorCode = require("../models/ErrorCodes.js");

const Logger = require("../Logger.js");

// https re-write function
router.use((req, res, next) => {
    if (!req.secure)
        res.redirect('https://' + req.headers.host + req.url);
    else
        return next();
});


router.use("/api", apiRouter);

router.use("/", express.static("build/client"));
router.use("*", express.static("build/client/index.html"));

router.use((err, req, res, next) => {
    if (err) {
        if(err instanceof ErrorCode) {
            if(req.api)
                res.status(err.httpCode).json({error: err.name});
            else
                res.status(err.httpCode).send(err.name);

            if(err.logout && !res.headersSent) {
                req.session.destroy();
                req.logout();
            }
        } else {
            Logger.get("Router").error(`Error occured on ${req.originalUrl}`, { error: err, message: err.message, stack: err.stack });
            if(!res.headersSent) {
                if(req.api)
                    res.status(500).json({error: "Internal Server Error"});
                else
                    res.status(500).send("Internal Server Error");
            }
        }
    } else next();
});

module.exports = router;

