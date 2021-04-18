import winston from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';
import Transport from 'winston-transport';

import { App } from './App';

class DiscordTransport extends Transport {
    constructor(opts) {
        super(opts)
    }
    log(info, callback) {
        
        if(process.env.NODE_ENV !== "development")
            App.instance.discordClient.log(info);
        
        callback();
    }
}

export abstract class Logger {
    static transports = [
        new winston.transports.Console({ level: "silly", format: winston.format.simple() }),
        new winstonDailyRotateFile({
            dirname: "data/logs/",
            filename: "%DATE%.log",
            level: "info",
        }),
        new DiscordTransport({})
    ];

    static get(label?: string) {
        return winston.createLogger({
            format: winston.format.combine(
                winston.format.label({ label }),
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: Logger.transports,
        });
    }

}
