import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { DEFAULT_LOGGER } from "../constants";
import BaseCommand from "./base_command";
import { removeTagCommand } from "./commands";

class RemoveTagCommand extends BaseCommand {
    constructor() {
        super({
            name: "remove_tag",
            description: "Removes one of the added tags from your server.",
            default_member_permissions: "0",
            dm_permission: false,
            options: [
                {
                    name: "tag",
                    description: "The name of the tag to remove",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        })
    }

    public handle = async (interaction: ChatInputCommandInteraction) => {
        if(!interaction.guildId) return interaction.reply("This command can only be run in a server.");
        await interaction.deferReply({
            ephemeral: true
        });

        const tagName = interaction.options.getString("tag", true);

        try {
            const r = await removeTagCommand(tagName, interaction.guildId);
            if(!r) return interaction.followUp(`"${tagName}" was not a tag on your server.`);
        } catch(e) {
            DEFAULT_LOGGER.log(e);
            return interaction.followUp("An unknown error has occured. The tag might have been removed from your server.");
        }

        return interaction.followUp(`"${tagName}" has been removed from the tag commands on your server.`);
    }
}

export default RemoveTagCommand;