const express = require('express')
const config = require('../../config.json')
const router = require('./router/index.js')

module.exports = class App {

    app = express();

    constructor() {
        
    }

    start() {
        this.app.use("/", router);

        return new Promise(async (resolve, reject) => {
            this.httpServer = this.app.listen(config.http.port, config.http.host, (error) => {
                if(error) {
                    return reject(error);
                }
                resolve(this.httpServer);
            });
        });
    }

    stop() {

    }
}