import { ChatInputCommandInteraction, CacheType, ApplicationCommandOptionType } from "discord.js";
import { BooruTag, getRandomImage } from "../booru";
import { DEFAULT_LOGGER, DEV_ENVIRONMENT } from "../constants";
import { getGuildSettings } from "../database";
import BaseCommand, { ApplicationCommandStructure } from "./base_command";

const tagDefinition = (tag: string): ApplicationCommandStructure => {
    return {
        name: (DEV_ENVIRONMENT ? "t_" : "") + tag,
        description: "Gets a random post from the " + tag + " tag.",
        options: [
            {
                name: "private",
                type: ApplicationCommandOptionType.Boolean,
                description: "If set to true, only you will be able to see the message",
                required: false
            }
        ]
    };
}

const tagHandle = async (interaction: ChatInputCommandInteraction) => {
    let ephemeral = interaction.options.getBoolean("private");
        if(ephemeral === null) ephemeral = false;

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

        getRandomImage(interaction.commandName.replace("t_", ""), true, interaction).then(res => {
            if(res.nsfw && !allowNSFW) return interaction.followUp("This server does not allow NSFW images in this channel.");
            return interaction.followUp({
                files: [
                    res.url
                ]
            });
        }).catch(error => {
            DEFAULT_LOGGER.log(error);
            if(error.response) {
                if(error.response.status == 404) {
                    return interaction.followUp("There weren't any posts found that match your query!").catch(DEFAULT_LOGGER.log);
                }
                return interaction.followUp("There was an error getting the response from DanBooru.").catch(DEFAULT_LOGGER.log);
            } else if(error.request) {
                return interaction.followUp("There was an error making the request to DanBooru.").catch(DEFAULT_LOGGER.log);
            } else return interaction.followUp("An unknown error has occurred.").catch(DEFAULT_LOGGER.log);
        });
}

export { tagDefinition, tagHandle };