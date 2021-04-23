import winston from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';
import Transport from 'winston-transport';
import { ConsoleTransportOptions } from 'winston/lib/winston/transports';

import { App } from './App';

class DiscordTransport extends Transport {
    constructor(opts?: ConsoleTransportOptions) {
        super(opts)
    }

    log(info, callback: () => void) {
        if(process.env.NODE_ENV !== "development")
            App.instance.discordClient.log(info);
        
        callback();
    }
}

export abstract class Logger {
    static transports = [
        new winston.transports.Console({ level: "unprioritized", format: winston.format.simple() }),
        new winstonDailyRotateFile({
            dirname: "data/logs/",
            filename: "%DATE%.log",
            level: "info",
        }),
        new DiscordTransport()
    ];

    static get(label?: string): winston.Logger {
        return winston.createLogger({
            format: winston.format.combine(
                winston.format.label({ label }),
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: Logger.transports,
            levels: {
                error: 0,
                warn: 1,
                success: 2,
                info: 3,
                unprioritized: 4
            }
        });
    }

}
