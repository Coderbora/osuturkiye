const winston = require('winston');
const winstonDailyRotateFile = require('winston-daily-rotate-file');
const Transport = require('winston-transport');

const DiscordClient = require('./DiscordClient.js')();

class DiscordTransport extends Transport {
    constructor(opts) {
        super(opts)
    }
    log(info, callback) {
        if(process.env.NODE_ENV !== "development")
            DiscordClient.log(info);
        
        callback();
    }
}

module.exports = class Logger {
    static transports = [
        new winston.transports.Console({ level: "unprioritized", format: winston.format.simple() }),
        new winstonDailyRotateFile({
            dirname: "data/logs/",
            filename: "%DATE%.log",
            level: "info",
        }),
        new DiscordTransport()
    ];

    static get(label) {
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
