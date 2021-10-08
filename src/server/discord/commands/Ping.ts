import { Command, CommandReturn } from '../models/ICommands';

export default <Command>{
    commandEnum: "PING",
    defaultPermission: false,
    name: "ping",
    description: "Ping!",
    options: [
        {
            name: "text",
            description: "Write something!",
            type: "STRING"
        }
    ],
    call({ interaction }): CommandReturn {
        const text = interaction.options.getString("text", false);

        if(text)
            return { message: { content: `Pong! Your message was ${text}` }};
        else return { message: { content: "Pong!" }};
    }
}