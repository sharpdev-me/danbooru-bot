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
                },
                {
                    name: "private",
                    type: ApplicationCommandOptionType.Boolean,
                    description: "If set to true, only you will be able to see the message",
                    required: false
                }
            ]
        })
    }

    public handle = async (interaction: ChatInputCommandInteraction<CacheType>) => {
        let append = interaction.options.getBoolean("append");
        if(append === null) append = true;

        let ephemeral = interaction.options.getBoolean("private");
        if(ephemeral === null) ephemeral = false;

        let searchQuery = interaction.options.getString("search", false);
        if(searchQuery == null) {
            append = false;
            searchQuery = "";
        }
        
        await interaction.deferReply({
            ephemeral: ephemeral
        });

        getRandomImage(searchQuery, append).then(url => {
            return interaction.followUp({
                files: [
                    url
                ]
            });
        }).catch(error => {
            FILE_LOGGER.log(`(query: ${append}, ${searchQuery}) ${error}`);
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

export default RandomCommand;