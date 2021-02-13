const winston = require('winston');
const winstonDailyRotateFile = require('winston-daily-rotate-file');

module.exports = class Logger {
    static transports = [
        new winston.transports.Console({ level: "silly", format: winston.format.simple() }),
        new winstonDailyRotateFile({
            dirname: "data/logs/",
            filename: "%DATE%.log",
            level: "info",
        }),
    ];

    static get(label) {
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
