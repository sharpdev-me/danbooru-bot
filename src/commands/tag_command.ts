import { ChatInputCommandInteraction, CacheType, ApplicationCommandOptionType } from "discord.js";
import { BooruTag, getRandomImage } from "../booru";
import { FILE_LOGGER } from "../constants";
import BaseCommand from "./base_command";

class TagCommand extends BaseCommand {
    constructor(public tag: BooruTag) {
        super({
            name: tag.name,
            description: "Gets a random post from the " + tag.name + " tag.",
            options: [
                {
                    name: "private",
                    type: ApplicationCommandOptionType.Boolean,
                    description: "If set to true, only you will be able to see the message",
                    required: false
                }
            ]
        });
    }

    public handle = async (interaction: ChatInputCommandInteraction<CacheType>) => {
        let ephemeral = interaction.options.getBoolean("private");
        if(ephemeral === null) ephemeral = false;

        await interaction.deferReply({
            ephemeral: ephemeral
        });

        getRandomImage(this.tag.name, true).then(url => {
            return interaction.followUp({
                files: [
                    url
                ]
            });
        }).catch(error => {
            FILE_LOGGER.log(error);
            if(error.response) {
                if(error.response.status == 404) {
                    return interaction.followUp("There weren't any posts found that match your query!").catch(FILE_LOGGER.log);
                }
                return interaction.followUp("There was an error getting the response from DanBooru.").catch(FILE_LOGGER.log);
            } else if(error.request) {
                return interaction.followUp("There was an error making the request to DanBooru.").catch(FILE_LOGGER.log);
            } else return interaction.followUp("An unknown error has occurred.").catch(FILE_LOGGER.log);
        });
    };
}

export default TagCommand;