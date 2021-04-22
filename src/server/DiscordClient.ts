import discord from 'discord.js';
import { Logger } from './Logger.js';
import { App } from './App';
import { DiscordAPIError } from "discord.js";
import { LogEntry } from "winston";

export class DiscordClient { 

    discordClient: discord.Client;
    logChannel!: discord.TextChannel;

    constructor() {
        this.discordClient = new discord.Client()
    }

    async start(token: string) {
        await this.discordClient.login(token).catch((error) => Logger.get("discord").error("Couldn't connect to discord!", { error }));
    }

    async stop() {
        await this.discordClient.destroy();
    }

    get discordGuild() {
        return this.discordClient.guilds.resolve(App.instance.config.discord.guildID);
    }

    async log(info: LogEntry) {
        if(App.instance.config.level_colors.hasOwnProperty(info.level)) {
            if(!this.logChannel)
                this.logChannel = await this.discordClient.channels.fetch(App.instance.config.discord.logChannel) as discord.TextChannel;

            await this.logChannel.send({
                embed: {
                    title: info.label ? info.label : "",
                    description: info.message,
                    timestamp: info.timestamp,
                    color: App.instance.config.level_colors[info.level]
                }
            })
        }
    }

    async fetchMember(id: string, ignoreCache = false) {
        let discordMember = null;

        try {
            discordMember = await this.discordGuild?.members.fetch({
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