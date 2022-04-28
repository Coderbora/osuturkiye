import { User, IUser } from "../models/User";
import { App } from "../App";
import { Logger } from '../Logger';
import { Command, CommandReturn } from "./models/ICommands";

export class PermissionsManager {

    async init(): Promise<void> {
        App.instance.discordClient.commandManager
            .initCommand(this.buildPermissionsCommand())
    }

    async fetchCommandUsers(commandEnum: string): Promise<IUser[]> {
        return await User.find({ 'discord.permissions': commandEnum });
    }
    
    async addPermission(commandEnum: string, user: IUser): Promise<void> {
        const appCommand = App.instance.discordClient.commandManager.getAppCommand(commandEnum);
        if (!appCommand) throw { customMsg: "There is no command with this enum." };

        // mongodb push enum to user permissions
        if(user.discord.userId === App.instance.config.discord.administratorID)
            throw { customMsg: "You cannot modify Administrator's perms." }

        if(user.discord.permissions.includes(commandEnum))
            throw { customMsg: "User already has access to this command." }
        
        user.discord.permissions.push(commandEnum);

        await user.save();

        await this.loadCommandPermission(commandEnum);
    }

    async deletePermission(commandEnum: string, user: IUser): Promise<void> {
        const appCommand = App.instance.discordClient.commandManager.getAppCommand(commandEnum);
        if (!appCommand) throw { customMsg: "There is no command with this enum." };

        // mongodb del enum from user permissions
        if(user.discord.userId === App.instance.config.discord.administratorID)
            throw { customMsg: "You cannot modify Administrator's perms." }

        if(!user.discord.permissions.includes(commandEnum))
            throw { customMsg: "User already cannot access to this command." }

        const enumIndex = user.discord.permissions.indexOf(commandEnum);
        user.discord.permissions.splice(enumIndex, 1);

        await user.save();

        await this.loadCommandPermission(commandEnum);
    }

    async loadCommandPermission(commandEnum: string): Promise<void> {
        const command = App.instance.discordClient.commandManager.getCommand(commandEnum);
        if (!command) throw "There is no command with this enum.";

        const commandUsers = await this.fetchCommandUsers(commandEnum);
        const commandUserIds = commandUsers.map(user => user.discord.userId);

        if(App.instance.config.discord.administratorID !== ""
            && commandUserIds.indexOf(App.instance.config.discord.administratorID) === -1)
            commandUserIds.push(App.instance.config.discord.administratorID)
        
        command.permissions = commandUserIds;
    }

    private buildPermissionsCommand() {
        const choices = App.instance.discordClient.commandManager.getPermissionEnumListChoices();
        return <Command>{
            commandEnum: "PERMISSIONS",
            defaultPermission: false,
            name: "permissions",
            description: "permissions!",
            options: [
                {
                    name: "add",
                    description: "Add permissions!",
                    type: "SUB_COMMAND_GROUP",
                    options: [
                        {
                            name: "osu",
                            description: "osu! Resolvable (username or user id)",
                            type: "SUB_COMMAND",
                            options: [
                                {
                                    name: "osu_resolvable",
                                    description: "The osu username or user id",
                                    type: "STRING",
                                    required: true
                                },
                                {
                                    name: "commandenum",
                                    description: "The command enum id",
                                    type: "STRING",
                                    required: true,
                                    choices: choices
                                }
                            ]
                        },
                        {
                            name: "discord",
                            description: "Discord User",
                            type: "SUB_COMMAND",
                            options: [
                                {
                                    name: "user",
                                    description: "The Discord user",
                                    type: "USER",
                                    required: true
                                },
                                {
                                    name: "commandenum",
                                    description: "The command enum id",
                                    type: "STRING",
                                    required: true,
                                    choices: choices
                                }
                            ]
                        },
                    ]
                },
                {
                    name: "remove",
                    description: "Remove permissions!",
                    type: "SUB_COMMAND_GROUP",
                    options: [
                        {
                            name: "osu",
                            description: "osu! Resolvable (username or user id)",
                            type: "SUB_COMMAND",
                            options: [
                                {
                                    name: "osu_resolvable",
                                    description: "The osu username or user id",
                                    type: "STRING",
                                    required: true
                                },
                                {
                                    name: "commandenum",
                                    description: "The command enum id",
                                    type: "STRING",
                                    required: true,
                                    choices: choices
                                }
                            ]
                        },
                        {
                            name: "discord",
                            description: "Discord User",
                            type: "SUB_COMMAND",
                            options: [
                                {
                                    name: "user",
                                    description: "The Discord user",
                                    type: "USER",
                                    required: true
                                },
                                {
                                    name: "commandenum",
                                    description: "The command enum id",
                                    type: "STRING",
                                    required: true,
                                    choices: choices
                                }
                            ]
                        },
                    ]
                }
            ],
            async call({ interaction }): Promise<CommandReturn> {
                const action = interaction.options.getSubcommandGroup();
                const type = interaction.options.getSubcommand();

                const commandEnum = interaction.options.getString("commandenum");

                let user: IUser | null;

                if (type == "discord") {
                    user = await User.findOne({ "discord.userId": interaction.options.getMember("user", false) });
                } else if (type == "osu") {
                    user = await User.byOsuResolvable(interaction.options.getString("osu_resolvable"));
                } else user = null;
                
                if(!user) return { message: { content: "Cannot find the user in database." } }

                try {
                    if(action == "add") await App.instance.discordClient.permissionsManager.addPermission(commandEnum, user);
                    else if(action == "remove") await App.instance.discordClient.permissionsManager.deletePermission(commandEnum, user);
                    else throw "Unrecognized option.";

                    return { message: { content: "Successfully updated the user permissions." } }
                } catch(err) {
                    if(err.customMsg)
                        return { message: { content: err.customMsg } }
                    else {
                        Logger.get("PermissionsManager").error("Error occured on permission call", err);
                    }
                }
            }
        }
    }
}