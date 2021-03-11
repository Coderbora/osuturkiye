const express = require('express');
const mongoose = require('mongoose');

const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');

const Logger = require('./Logger.js');
const DiscordClient = require('./DiscordClient.js')();
const Cron = require('./Cron.js')();

const config = require('../../config.json');
const router = require('./router/index.js');

mongoose.Promise = global.Promise

let mInstance = null;

class App {

    app = express();
    logger = Logger.get();
    httpServer = null;
    httpsServer = null;
    credentials = {};

    constructor() {
        
    }

    async start() {
        this.app.use(express.static(path.join(__dirname, "static"), { dotfiles: 'allow' }));
        this.app.use("/", router);

        if (config.https.enable) {
            this.credentials = {
                key: fs.readFileSync(config.https.privateKeyPath, 'utf8'),
                cert: fs.readFileSync(config.https.certificatePath, 'utf8')
            }
        }

        mongoose.connect(config.mongo.uri, { autoIndex: false, useNewUrlParser: true });

        await DiscordClient.start(config.discord.token);

        Cron.init();

        return new Promise(async (resolve, reject) => {
            this.httpServer = http.createServer(this.app);
            this.httpServer.listen(config.http.port, config.http.host, (error) => {
                if(error) {
                    this.logger.error("Error while listening http port!", { error });
                    return reject(error);
                }
                this.logger.info(`Listening HTTP requests on ${config.http.publicUrl} !`);
            });

            if (config.https.enable) {
                this.httpsServer = https.createServer(this.credentials, this.app);
                this.httpsServer.listen(config.https.port, config.https.host, (error) => {
                    if(error) {
                        this.logger.error("Error while listening https port!", { error });
                        return reject(error);
                    }
                    this.logger.info(`Listening HTTPS requests on ${config.https.publicUrl} !`);
                });
            }

            resolve();
        }); 
    }

    stop() {
        this.logger.info("Stopping the app!");
        return new Promise(async (resolve, reject) => {
            await DiscordClient.stop();
            Cron.stop();
            this.httpServer.close((error) => {
                if(error) {
                    this.logger.error("Error while closing the http server!", { error });
                    return reject(error);
                }
            });

            if(config.https.enable) {
                this.httpsServer.close((error) => {
                    if(error) {
                        this.logger.error("Error while closing the https server!", { error });
                        return reject(error);
                    }
                });    
            }

            this.logger.info("Stopped the app!");
            resolve();
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