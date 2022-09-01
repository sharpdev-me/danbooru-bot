import { ChatInputCommandInteraction, CacheType } from "discord.js";
import { BooruTag, getRandomImage } from "../booru";
import { FILE_LOGGER } from "../constants";
import BaseCommand from "./base_command";

class TagCommand extends BaseCommand {
    constructor(public tag: BooruTag) {
        super({
            name: tag.name,
            description: "Gets a random post from the " + tag.name + " tag."
        });
    }

    public handle = async (interaction: ChatInputCommandInteraction<CacheType>) => {
        await interaction.deferReply({
            ephemeral: false
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