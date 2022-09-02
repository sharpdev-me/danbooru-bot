import { ChatInputCommandInteraction, CacheType, EmbedBuilder } from "discord.js";
import { CURRENT_VERSION, DEFAULT_SEARCH, DEFAULT_LOGGER, GUILD_COUNT } from "../constants";
import { getGuildSettings } from "../database";
import BaseCommand from "./base_command";

class AboutCommand extends BaseCommand {
    constructor() {
        super({
            name: "about",
            description: "Gives a brief description of the bot."
        })
    }

    public handle = async (interaction: ChatInputCommandInteraction<CacheType>) => {
        interaction.ephemeral = true;

        let qq = DEFAULT_SEARCH;
        if(interaction.guildId) {
            const settings = await getGuildSettings(interaction.guildId);
            qq = settings.defaultSearch;
        }

        const builder = new EmbedBuilder();

        builder.setTitle("DanBooru Bot");
        builder.setFooter({
            text: "Made by SharpDev#1101"
        });
        builder.addFields(
            {name: "Version", value: CURRENT_VERSION, inline: true},
            {name: "Guild Count", value: String(GUILD_COUNT(interaction.client)), inline: true},
            {name: "Default Search", value: qq, inline: false}
        );

        interaction.reply({
            embeds: [builder],
            ephemeral: true
        }).catch(DEFAULT_LOGGER.log);
    };
}

export default AboutCommand;