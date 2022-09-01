import axios from "axios";
import { ApplicationCommandOptionType, Attachment, CacheType, ChatInputCommandInteraction, MessagePayload } from "discord.js";
import { getRandomImage } from "../booru";
import { DANBOORU_URL, DEFAULT_SEARCH, FILE_LOGGER } from "../constants";
import BaseCommand from "./base_command";

class RandomCommand extends BaseCommand {
    constructor() {
        super({
            name: "random",
            description: "Fetches a random image, optionally with search parameters",
            options: [
                {
                    name: "search",
                    description: `The search terms used for the search`,
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "append",
                    type: ApplicationCommandOptionType.Boolean,
                    description: `Appends the search query to the default search`,
                    required: false
                }
            ]
        })
    }

    public handle = async (interaction: ChatInputCommandInteraction<CacheType>) => {
        let append = interaction.options.getBoolean("append");
        if(append === null) append = true;

        let searchQuery = interaction.options.getString("search", false);
        if(searchQuery == null) {
            append = false;
            searchQuery = "";
        }
        
        await interaction.deferReply({
            ephemeral: false
        });

        getRandomImage(searchQuery, append).then(url => {
            return interaction.followUp({
                files: [
                    url
                ]
            });
        }).catch(error => {
            FILE_LOGGER.log(error);
            if(error.response) {
                return interaction.followUp("There was an error getting the response from DanBooru.");
            } else if(error.request) {
                return interaction.followUp("There was an error making the request to DanBooru.");
            } else return interaction.followUp("An unknown error has occurred.");
        });
    };
}

export default RandomCommand;