const express = require('express');
const mongoose = require('mongoose');

const Logger = require('./Logger.js');
const DiscordClient = require('./DiscordClient.js')();
const osuApi = require('./OsuApiV2.js');

const config = require('../../config.json');
const router = require('./router/index.js');

mongoose.Promise = global.Promise

let mInstance = null;

class App {

    app = express();
    logger = Logger.get();
    httpServer = null;
    osuApiV2 = osuApi(config.osu.client_id, config.osu.client_secret);

    constructor() {
        
    }

    start() {
        this.app.use("/", router);

        mongoose.connect(config.mongo.uri, { autoIndex: false, useNewUrlParser: true });

        DiscordClient.start(config.discord.token);

        return new Promise(async (resolve, reject) => {
            this.httpServer = this.app.listen(config.http.port, config.http.host, (error) => {
                if(error) {
                    this.logger.error("Error while listening!", { error });
                    return reject(error);
                }
                this.logger.info(`Listening requests on ${config.http.publicUrl} !`);
                resolve(this.httpServer);
            });
        }); 
    }

    stop() {
        this.logger.info("Stopping the app!");
        return new Promise(async (resolve, reject) => {
            await DiscordClient.stop();
            this.httpServer.close((error) => {
                if(error) {
                    this.logger.error("Error while closing the http server!", { error });
                    return reject(error);
                }
                this.logger.info("Stopped the app!");
                resolve();
            });
        });
    }
}

module.exports = () => {
    if(mInstance == null) {
        mInstance = new App();
        global.app = mInstance;
    }
    return mInstance;
}