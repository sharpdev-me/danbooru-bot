import axios from "axios";
import { ApplicationCommandOptionType, Attachment, CacheType, ChatInputCommandInteraction, MessagePayload } from "discord.js";
import { getRandomImage } from "../booru";
import { DANBOORU_URL, DEFAULT_SEARCH, DEFAULT_LOGGER } from "../constants";
import { getGuildSettings } from "../database";
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

        let allowNSFW = true;
        if(interaction.guildId) {
            const settings = await getGuildSettings(interaction.guildId);
            if(settings.whitelistNSFW) {
                allowNSFW = false;

                if(settings.nsfwChannels.includes(interaction.channelId)) allowNSFW = true;
            }
        }

        getRandomImage(searchQuery, append, interaction).then(res => {
            if(res.nsfw && !allowNSFW) return interaction.followUp("This server does not allow NSFW images in this channel.");
            return interaction.followUp({
                files: [
                    res.url
                ]
            });
        }).catch(error => {
            DEFAULT_LOGGER.log(`(query: ${append}, ${searchQuery}) ${error}`);
            if(error.response) {
                if(error.response.status == 404) {
                    return interaction.followUp("There weren't any posts found that match your query!").catch(DEFAULT_LOGGER.log);
                }
                return interaction.followUp("There was an error getting the response from DanBooru.").catch(DEFAULT_LOGGER.log);
            } else if(error.request) {
                return interaction.followUp("There was an error making the request to DanBooru.").catch(DEFAULT_LOGGER.log);
            } else return interaction.followUp("An unknown error has occurred.").catch(DEFAULT_LOGGER.log);
        });
    };
}

export default RandomCommand;