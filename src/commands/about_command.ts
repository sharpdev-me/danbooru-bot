import { ChatInputCommandInteraction, CacheType, EmbedBuilder } from "discord.js";
import { CURRENT_VERSION, DEFAULT_SEARCH, FILE_LOGGER, GUILD_COUNT } from "../constants";
import BaseCommand from "./base_command";

class AboutCommand extends BaseCommand {
    constructor() {
        super({
            name: "about",
            description: "Gives a brief description of the bot."
        })
    }

    public handle = (interaction: ChatInputCommandInteraction<CacheType>) => {
        interaction.ephemeral = true;

        const builder = new EmbedBuilder();

        builder.setTitle("DanBooru Bot");
        builder.setFooter({
            text: "Made by SharpDev#1101"
        });
        builder.addFields(
            {name: "Version", value: CURRENT_VERSION, inline: true},
            {name: "Guild Count", value: String(GUILD_COUNT(interaction.client)), inline: true},
            {name: "Default Search", value: DEFAULT_SEARCH, inline: false}
        );

        interaction.reply({
            embeds: [builder],
            ephemeral: true
        }).catch(FILE_LOGGER.log);
    };
}

export default AboutCommand;