const discord = require('discord.js');
const Logger = require('./Logger.js');
const config = require('../../config.json');
const { DiscordAPIError } = require("discord.js");

let mInstance = null;

class DiscordClient { 

    static discordClient = null;
    logChannel = null;

    constructor() {
        this.discordClient = new discord.Client()
    }

    async start(token) {
        await this.discordClient.login(token).catch((error) => Logger.get("discord").error("Couldn't connect to discord!", { error }));
    }

    async stop() {
        await this.discordClient.destroy();
    }

    get discordGuild() {
        return this.discordClient.guilds.resolve(config.discord.guildID);
    }

    async log(info) {
        if(config.level_colors.hasOwnProperty(info.level)) {
            if(!this.logChannel)
                this.logChannel = await this.discordClient.channels.fetch(config.discord.logChannel);

            await this.logChannel.send({
                embed: {
                    title: info.label ? info.label : "",
                    description: info.message,
                    timestamp: info.timestamp,
                    color: config.level_colors[info.level]
                }
            })
        }
    }

    async fetchMember(id, ignoreCache = false) {
        let discordMember = null;

        try {
            discordMember = await this.discordGuild.members.fetch({
                user: id,
                force: ignoreCache
            });
        } catch(err) {
            if(!(err instanceof DiscordAPIError && (err.code === 10007 || err.code === 10013)))
                throw err;
        }

        return discordMember;
    }
}

module.exports = () => {
    if(mInstance == null)
        mInstance = new DiscordClient();
    return mInstance;
  }