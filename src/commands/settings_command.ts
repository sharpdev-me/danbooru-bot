import { ApplicationCommandBooleanOption, ApplicationCommandOption, ApplicationCommandOptionType, ApplicationCommandStringOption, ApplicationCommandSubCommand, ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js";
import { DEFAULT_LOGGER } from "../constants";
import { defaultGuildSettings, getGuildSettings, saveGuildSettings } from "../database";
import BaseCommand from "./base_command";

class SettingsCommand extends BaseCommand {
    constructor() {
        super({
            name: "settings",
            description: "Allows you to change various settings of your server.",
            dm_permission: false,
            default_member_permissions: "0",
            options: [
                {
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    name: "get",
                    description: "Gets the value of a setting.",
                    options: [
                        {
                            name: "default_search",
                            description: "The default search query for your server.",
                            type: ApplicationCommandOptionType.Subcommand,
                        },
                        {
                            name: "whitelist_nsfw",
                            description: "If enabled, NSFW images can only be posted in whitelist channels (/channels)",
                            type: ApplicationCommandOptionType.Subcommand
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    name: "set",
                    description: "Sets the value of a setting.",
                    options: [
                        {
                            name: "default_search",
                            description: "The default search query for your server.",
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: "value",
                                    type: ApplicationCommandOptionType.String,
                                    description: "The new default search query",
                                    required: true
                                }
                            ]
                        },
                        {
                            name: "whitelist_nsfw",
                            description: "If enabled, NSFW images can only be posted in whitelist channels (/channels)",
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: "value",
                                    type: ApplicationCommandOptionType.Boolean,
                                    description: "Whether or not the NSFW whitelist should be enabled.",
                                    required: true
                                }
                            ]
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    name: "reset",
                    description: "Resets the value of a setting.",
                    options: [
                        {
                            name: "default_search",
                            description: "The default search query for your server.",
                            type: ApplicationCommandOptionType.Subcommand,
                        },
                        {
                            name: "whitelist_nsfw",
                            description: "If enabled, NSFW images can only be posted in whitelist channels (/channels)",
                            type: ApplicationCommandOptionType.Subcommand
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "list",
                    description: "Lists all the server's settings.",
                    options: []
                }
            ]
        })
    }

    public handle = async (interaction: ChatInputCommandInteraction) => {
        const command = interaction.options.getSubcommand(true);
        const group = interaction.options.getSubcommandGroup();
        await interaction.deferReply({
            ephemeral: true
        });

        const settings = await getGuildSettings(interaction.guildId!);

        const builder = new EmbedBuilder();
        builder.setColor(Colors.Blue);
        builder.setFooter({
            text: "Made by SharpDev#1101",
        });

        builder.setTitle(command);

        const settingName = command == "default_search" ? "defaultSearch" : "whitelistNSFW";

        if(command == "list") {
            builder.setTitle("Settings List");
            builder.addFields(
                {
                    name: "Default Query",
                    value: settings.defaultSearch
                },
                {
                    name: "Whitelist NSFW",
                    value: String(settings.whitelistNSFW)
                }
            );
        }
        if(group == "get") {
            builder.addFields(
                {
                    name: "Value",
                    value: String((settings as any)[settingName]),
                    inline: false
                },
                {
                    name: "Default Value",
                    value: String((defaultGuildSettings(interaction.guildId!) as any)[settingName]),
                    inline: false
                }
            );
        } else if(group == "set") {
            builder.addFields(
                {
                    name: "Old Value",
                    value: String((settings as any)[settingName]),
                    inline: false
                },
                {
                    name: "New Value",
                    value: String(interaction.options.get("value", true).value),
                    inline: false
                }
            );

            (settings as any)[settingName] = interaction.options.get("value", true).value;
            await saveGuildSettings(settings).catch(DEFAULT_LOGGER.log);
        } else if(group == "reset") {
            builder.addFields(
                {
                    name: "Value",
                    value: String((defaultGuildSettings(interaction.guildId!) as any)[settingName]),
                    inline: false
                }
            );

            (settings as any)[settingName] = (defaultGuildSettings(interaction.guildId!) as any)[settingName];
            await saveGuildSettings(settings).catch(DEFAULT_LOGGER.log);
        }


        interaction.followUp({
            embeds: [
                builder
            ]
        }).catch(DEFAULT_LOGGER.log);
    }
}

export default SettingsCommand;