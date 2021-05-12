import { CommandInteraction, MessageOptions, ApplicationCommandData } from "discord.js";

export interface Command extends ApplicationCommandData {
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