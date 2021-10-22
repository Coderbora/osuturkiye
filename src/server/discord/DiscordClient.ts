import discord from 'discord.js';
import { Logger } from '../Logger';
import { App } from '../App';
import { DiscordAPIError } from "discord.js";
import { LogEntry } from "winston";

import { PermissionsManager } from "./PermissionsManager";
import { CommandManager } from "./CommandManager";

export class DiscordClient { 

    discordClient: discord.Client;
    logChannel!: discord.TextChannel;
    permissionsManager: PermissionsManager;
    commandManager: CommandManager;

    constructor() {
        this.discordClient = new discord.Client({ intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES] });
        this.commandManager = new CommandManager();
        this.permissionsManager = new PermissionsManager();
        this.discordClient.on("ready", () => {
            if(process.env.NODE_ENV !== "development") {
                this.commandManager.init();
                this.permissionsManager.init();
            }
        });

        this.discordClient.on("interactionCreate", async interaction => {
            if(!interaction.isCommand()) return;

            await this.commandManager.handleInteractions(interaction);
        })
    }

    async start(token: string): Promise<void> {
        await this.discordClient.login(token).catch((error) => Logger.get("discord").error("Couldn't connect to discord!", { error }));
    }

    async stop(): Promise<void> {
        if(process.env.NODE_ENV !== "development") await this.commandManager.stop();
        this.discordClient.destroy();
    }

    get discordGuild(): discord.Guild {
        return this.discordClient.guilds.resolve((App.instance.config.discord.guildID) as discord.Snowflake);
    }

    async log(info: LogEntry): Promise<void> {
        if(info.level in App.instance.config.level_colors) {
            if(!this.logChannel)
                this.logChannel = await this.discordClient.channels.fetch((App.instance.config.discord.logChannel) as discord.Snowflake) as discord.TextChannel;

            await this.logChannel.send({
                embeds: [{
                    title: info.label ? info.label : "",
                    description: info.message,
                    timestamp: info.timestamp,
                    color: App.instance.config.level_colors[info.level]
                }]
            })
        }
    }

    async fetchMember(id: string, ignoreCache = false): Promise<discord.GuildMember | null> {
        let discordMember = null;

        try {
            discordMember = await this.discordGuild?.members.fetch({
                user: id as discord.Snowflake,
                force: ignoreCache
            });
        } catch(err) {
            if(!(err instanceof DiscordAPIError && (err.code === 10007 || err.code === 10013)))
                throw err;
        }

        return discordMember;
    }
}