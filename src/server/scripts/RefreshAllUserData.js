const mongoose = require('mongoose');
const DiscordClient = require("../DiscordClient.js")();
const { User } = require("../models/User.js");

const Logger = require("../Logger.js");

module.exports = class RefreshAllUserData {
    logger = Logger.get("scripts/RefreshAllUserData");

    CONCURRENCY = 20;

    async run() {
        if(mongoose.connection.readyState !== 0 && DiscordClient.discordClient.ws.status === 0) {
            this.logger.info("Fetching users!");
            const users = await User.find({ discord: { $exists: true } });
            this.logger.info(`Found ${ users.length } users to refresh!`);
            const pendingUsers = [ ...users ];

            while(pendingUsers.length > 0) {
                const promises = [];
                const currentUsers = pendingUsers.splice(0, this.CONCURRENCY);
                for(const user of currentUsers)
                    promises.push(user.updateUser().catch(error =>
                        this.logger.error("An error occured while processing this user", { error, user })
                    ));
    
                await Promise.all(promises);
                this.logger.info("Processed " + (users.length - pendingUsers.length) + " out of " + users.length);
            }

            this.logger.info("Refreshing users done!");
        } else {
            this.logger.error("Cancelled the script because of connection error!");
        }
    }
}