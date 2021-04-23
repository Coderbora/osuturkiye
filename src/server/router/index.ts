import express from "express";
import promiseRouter from "express-promise-router";
import { ApiRouter } from "./api/index.js";

import { App } from "../App";
import { Logger } from "../Logger";

export class MainRouter {
    public readonly router = promiseRouter();

    constructor() {
        // https re-write function
        if(App.instance.config.https.enable) {
            this.router.use((req, res, next) => {
                if (!req.secure)
                    res.redirect('https://' + req.headers.host + req.url);
                else
                    return next();
            });
        }

        this.router.use("/api", (new ApiRouter).router);

        this.router.use("/", express.static("build/client"));
        this.router.use("*", express.static("build/client/index.html"));

        this.router.use((err, req, res, next) => {
            if (err) {
                if(err.custom) {
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
    }
}
