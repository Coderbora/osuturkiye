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

export enum COMMAND_TYPES {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9
}