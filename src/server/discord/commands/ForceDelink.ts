import { User } from '../../models/User';
import { Command, CommandReturn } from '../models/ICommands';

export default <Command>{
    commandEnum: "FORCEDELINK",
    defaultPermission: false,
    name: "forcedelink",
    description: "Force delink someone!",
    options: [
        {
            name: "osu",
            description: "Force delink someone with their osu! Resolvable",
            type: "SUB_COMMAND",
            options: [{
                name: "user_resolvable",
                description: "The osu username or user id",
                type: "STRING",
                required: true
            }]
        },
        {
            name: "discord",
            description: "Force delink someone with their Discord",
            type: "SUB_COMMAND",
            options: [{
                name: "user_resolvable",
                description: "The Discord User",
                type: "USER",
                required: true
            }]
        }
    ],
    async call({ interaction }): Promise<CommandReturn> {
        const type = interaction.options.find(i => i.type == "SUB_COMMAND").name;
        const resolvable = interaction.options.find(i => i.name == "user_resolvable").value.toString();

        const user = type == "discord" ? await User.findOne({ "discord.userId": resolvable }) : await User.byOsuResolvable(resolvable)
                
        if(!user) return { message: { content: "Cannot find the user in database." } }

        if(user.discord) {
            await user.discord.delink();
            user.discord = undefined;
            await user.save();
            return { message: { content: "Successfully completed the operation." } };
        } else {
            return { message: { content: "User does not have any discord information." } };
        }
    }
}