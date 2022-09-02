import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { getTag } from "../booru";
import { DEFAULT_LOGGER } from "../constants";
import BaseCommand from "./base_command";
import { registerTagCommand } from "./commands";
import { tagDefinition } from "./tag_command";

class AddTagCommand extends BaseCommand {
    constructor() {
        super({
            name: "add_tag",
            description: "Adds a new convenience tag to your server's commands.",
            default_member_permissions: "0",
            dm_permission: false,
            options: [
                {
                    name: "tag",
                    description: "The name of tag to add",
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
        const tag = await getTag(tagName);

        if(tag == null) return interaction.followUp("That tag could not be found on DanBooru.");

        try {
            await registerTagCommand(tagDefinition(tag.name), interaction.guildId);
        } catch(e) {
            DEFAULT_LOGGER.log(e);
            return interaction.followUp("An unknown error has occured. The tag could not be added to your server.");
        }

        return interaction.followUp(`"${tag.name}" has been added to the list of tag commands on your server!`);
    }
}

export default AddTagCommand;