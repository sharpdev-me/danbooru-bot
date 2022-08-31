import { ChatInputCommandInteraction, CacheType } from "discord.js";
import { BooruTag, getRandomImage } from "../booru";
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
            if(error.response) {
                return interaction.followUp("There was an error getting the response from DanBooru.");
            } else if(error.request) {
                return interaction.followUp("There was an error making the request to DanBooru.");
            } else return interaction.followUp("An unknown error has occurred.");
        });
    };
}

export default TagCommand;