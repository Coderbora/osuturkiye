const discord = require('discord.js');
const Logger = require('./Logger.js');
const config = require('../../config.json');

let mInstance = null;

class DiscordClient { 

    static discordClient = null;

    constructor() {
        this.discordClient = new discord.Client()
    }

    start(token) {
        this.discordClient.login(token).catch((error) => Logger.get("discord").error("Couldn't connect to discord!", { error }));
    }

    async stop() {
        await this.discordClient.destroy();
    }

    get discordGuild() {
        return this.discordClient.guilds.resolve(config.discord.guildID);
    }
}

module.exports = () => {
    if(mInstance == null)
        mInstance = new DiscordClient();
    return mInstance;
  }