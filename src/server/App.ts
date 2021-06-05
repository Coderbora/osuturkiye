import express from 'express';
import mongoose from 'mongoose';

import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';

import { Logger } from './Logger';
import { DiscordClient } from './discord/DiscordClient';
import { Cron } from './Cron';

import { Config } from './Config';
import { MainRouter } from './router/index';

mongoose.Promise = global.Promise

export class App {

    public static instance = new App();

    public app = express();
    public cron = new Cron();
    public discordClient = new DiscordClient();
    public logger = Logger.get();
    public config = new Config();
    public httpServer: http.Server;
    public httpsServer?: https.Server;
    public credentials = {};

    public clientCredential = "";

    constructor() {
        this.httpServer = http.createServer(this.app);

        if (this.config.https.enable) {
            this.credentials = {
                key: fs.readFileSync(this.config.https.privateKeyPath, 'utf8'),
                cert: fs.readFileSync(this.config.https.certificatePath, 'utf8')
            }

            this.httpsServer = https.createServer(this.credentials, this.app);
        }
    }

    async start(): Promise<void> {
        this.app.use(express.static(path.join(__dirname, "static"), { dotfiles: 'allow' }));
        this.app.use("/", (new MainRouter()).router);

        mongoose.connect(this.config.mongo.uri, { autoIndex: false, useNewUrlParser: true });

        await this.discordClient.start(this.config.discord.token);

        this.cron.init();

        this.httpServer.listen(this.config.http.port, this.config.http.host, () => {
            this.logger.info(`Listening HTTP requests on ${this.config.http.publicUrl} !`);
        });

        this.httpsServer?.listen(this.config.https.port, this.config.https.host, () => {
            this.logger.info(`Listening HTTPS requests on ${this.config.https.publicUrl} !`);
        });
    }

    async stop(): Promise<void> {
        this.logger.info("Stopping the app!");
            await this.discordClient.stop();
            this.cron.stop();
            this.httpServer.close((error) => {
                if(error) {
                    this.logger.error("Error while closing the http server!", { error });
                    throw error;
                }
            });

            this.httpsServer?.close((error) => {
                if(error) {
                    this.logger.error("Error while closing the https server!", { error });
                    throw error;
                }
            });    

            this.logger.info("Stopped the app!");
    }
}