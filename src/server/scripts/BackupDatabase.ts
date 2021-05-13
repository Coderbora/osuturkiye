import mongoose from 'mongoose';
import { spawn } from 'child_process';
import { parse } from 'mongodb-uri';
import { join } from 'path';

import { Logger } from '../Logger';
import { App } from '../App';
import { IScript } from '../models/IScript';


// Make sure you have `mongodump` in your PATH values.
export default class BackupDatabase implements IScript {
    logger = Logger.get("scripts/BackupDatabase");

    async run(): Promise<void> {
        return new Promise((resolve, reject) => {
            if(mongoose.connection.readyState !== 0) {
                this.logger.info("Trying to backup database!");
                const parsedUri = parse(App.instance.config.mongo.uri);
    
                if(parsedUri.hosts.length < 1 || !parsedUri.database) reject("Please correctly configure your mongo settings!");
    
                const mongodump = spawn(["mongodump", "--host", parsedUri.hosts[0].host,
                    "--port", parsedUri.hosts[0].port, "--db", parsedUri.database, "--out",
                     join(__dirname, '../../../', App.instance.config.mongo.backupDir, '`date +"%m-%d-%y"`')].join(" "))
                
                mongodump.on("close", (code) => {
                    if (code > 0) { 
                        this.logger.error("Mongodump exited with code " + code);
                        reject("An error occured during mongodump process.");
                    }
                    this.logger.info("Database backup done!");
                    resolve();
                })
            } else {
                reject("Cancelled the script because of connection error!");
            }
        })
    }
}