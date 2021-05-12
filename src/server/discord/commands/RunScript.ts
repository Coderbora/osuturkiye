
import { readdirSync } from 'fs';
import { resolve, extname } from 'path';
import { App } from '../../App';
import { Command, CommandReturn } from '../models/ICommands';

export default <Command>{
    commandEnum: "RUNSCRIPT",
    defaultPermission: false,
    name: "runscript",
    description: "Manually run scripts!",
    options: [
        {
            name: "script",
            description: "Name of the script",
            type: "STRING",
            required: true,
            choices: readdirSync(resolve(__dirname, "../../scripts")).filter(f => extname(f) === ".js")
                .map(f => ({
                name: f.split(".")[0],
                value: f.split(".")[0]
            }))
        }
    ],
    call({ interaction }): CommandReturn {
        const scriptName = interaction.options[0].value.toString();
        return { message: { content: App.instance.cron.runScriptManually(scriptName) } }
    }
}