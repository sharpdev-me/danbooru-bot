import { ApplicationCommandOptionType, ChannelType, ChatInputCommandInteraction, Colors, EmbedBuilder, GuildTextBasedChannel, TextChannel } from "discord.js";
import { DEFAULT_LOGGER } from "../constants";
import { getGuildSettings, saveGuildSettings } from "../database";
import BaseCommand from "./base_command";

class ChannelsCommand extends BaseCommand {
    constructor() {
        super({
            name: "channels",
            description: "Manages your channel settings.",
            dm_permission: false,
            default_member_permissions: "0",

            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "set_nsfw",
                    description: "Toggles the channel as a whitelisted NSFW channel.",
                    options: [
                        {
                            name: "channel",
                            type: ApplicationCommandOptionType.Channel,
                            description: "The channel to modify",
                            channelTypes: [ChannelType.GuildText],
                            required: true
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "set_default_query",
                    description: "Sets the default query for this channel.",
                    options: [
                        {
                            name: "channel",
                            type: ApplicationCommandOptionType.Channel,
                            description: "The channel to modify",
                            channelTypes: [ChannelType.GuildText],
                            required: true
                        },
                        {
                            name: "query",
                            type: ApplicationCommandOptionType.String,
                            description: "The new default query for this channel. Leave blank to reset to the server's default.",
                            required: false
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "info",
                    description: "Gets information about the specified channel.",
                    options: [
                        {
                            name: "channel",
                            type: ApplicationCommandOptionType.Channel,
                            description: "The channel to modify",
                            channelTypes: [ChannelType.GuildText],
                            required: true
                        }
                    ]
                },
            ]
        });
    }

    public handle = async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({
            ephemeral: true
        });

        if(interaction.guildId) {
            const settings = await getGuildSettings(interaction.guildId);

            const command = interaction.options.getSubcommand(true);
            const channel = interaction.options.getChannel("channel", true);

            if(channel.type != ChannelType.GuildText) {
                interaction.followUp("This command only works on text channels.").catch(DEFAULT_LOGGER.log);
                return;
            }

            if(command == "set_nsfw") {
                if(settings.nsfwChannels.includes(channel.id)) {
                    const guildChannel = (await interaction.guild?.channels.fetch(channel.id)) as TextChannel;
                    settings.nsfwChannels.splice(settings.nsfwChannels.indexOf(channel.id), 1);
                    interaction.followUp(`${channel.name} has been unmarked as an NSFW-allowed channel.` + !guildChannel.nsfw ? "" : " You don't have this channel set as NSFW in its settings. Setting this allows your users to see a \"This channel is 18+\" warning before entering.").catch(DEFAULT_LOGGER.log);
                    return;
                }

                settings.nsfwChannels.push(channel.id);
                await saveGuildSettings(settings);
                
                interaction.followUp(`${channel.name} has been marked as an NSFW-allowed channel.`).catch(DEFAULT_LOGGER.log);
            } else if(command == "set_default_query") {
                const query = interaction.options.getString("query", false);
                settings.channelDefaultSearches[channel.id] = query;
                
                await saveGuildSettings(settings);

                if(query != null) {
                    interaction.followUp(`${channel.name}'s default query is now \`${query}\`.`).catch(DEFAULT_LOGGER.log);
                } else {
                    interaction.followUp(`${channel.name}'s default query has been reset to the server's default.`).catch(DEFAULT_LOGGER.log);
                }
            } else if(command == "info") {
                const builder = new EmbedBuilder();
                builder.setTitle(channel.name);
                builder.setColor(Colors.Blue);
                builder.setFooter({text:"Made by SharpDev#1101"});

                builder.addFields(
                    {
                        name: "NSFW?",
                        value: settings.nsfwChannels.includes(channel.id) ? "Yes" : "No",
                        inline: false
                    }
                );

                const u = settings.channelDefaultSearches[channel.id];
                if(u != null && u != undefined) {
                    builder.addFields(
                        {
                            name: "Query Override",
                            value: u,
                            inline: false
                        }
                    );
                }

                interaction.followUp({embeds:[builder]}).catch(DEFAULT_LOGGER.log);
            }

            return;
        }

        interaction.followUp("This command must only be run in a server.").catch(DEFAULT_LOGGER.log);
    }
}

export default ChannelsCommand;