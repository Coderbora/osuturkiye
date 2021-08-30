import { CommandInteraction, MessageOptions, ApplicationCommand } from "discord.js";

export interface Command extends ApplicationCommand {
    commandEnum: string;
    defaultPermission: boolean;
    fileName?: string;
    call: (obj?: CommandObject) => CommandReturn | Promise<CommandReturn>;
}

export interface CommandReturn {
    message: MessageOptions;
    edit_promise?: CommandReturn | Promise<CommandReturn>;
}

export interface CommandObject {
    interaction: CommandInteraction;
}