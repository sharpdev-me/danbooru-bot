import { ChatInputCommandInteraction, MessageContextMenuCommandInteraction, REST, Routes, Snowflake } from "discord.js";
import { getRandomImage, getTopTags } from "../booru";
import { APPLICATION_ID, BOT_TOKEN, DEV_ENVIRONMENT, DEV_SERVER, DEFAULT_LOGGER } from "../constants";

import AboutCommand from "./about_command";
import AddTagCommand from "./add_tag_command";
import BaseCommand, { ApplicationCommandStructure } from "./base_command";
import ChannelsCommand from "./channels_command";
import HelpCommand from "./help_command";
import RandomCommand from "./random_command";
import SettingsCommand from "./settings_command";
import { tagDefinition, tagHandle } from "./tag_command";

const rest = new REST({version: "10"}).setToken(BOT_TOKEN);

const commands: BaseCommand[] = [
    new AboutCommand(),
    new RandomCommand(),
    new HelpCommand(),
    new SettingsCommand(),
    new ChannelsCommand(),
    new AddTagCommand(),
];

const validationRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

const registerCommands = () => {
    return getTopTags(50).then(tags => {
        for (const tag of tags) {
            if(commands.findIndex(v => v.definition.name == tag.name) != -1) continue;
            if(!validationRegex.test(tag.name)) continue;
    
            commands.push({
                definition: tagDefinition(tag.name),
                handle: tagHandle
            });
        }
    }).then(() => {
        if(DEV_ENVIRONMENT) {
            const definitions = commands.map(c => c.definition);
            definitions.forEach((v, i, a) => {
                if(!a[i].name.startsWith("t_")) a[i].name = "t_" + v.name;
            });

            return rest.put(Routes.applicationGuildCommands(APPLICATION_ID, DEV_SERVER as string), {
                body: definitions
            });
        }
        return rest.put(Routes.applicationCommands(APPLICATION_ID), {
            body: commands.map(c => c.definition)
        });
    });
}

const registerTagCommand = (definition: ApplicationCommandStructure, guildID: Snowflake) => {
    return rest.post(Routes.applicationGuildCommands(APPLICATION_ID, guildID), {
        body: definition
    });
}

const commandHandler = (interaction: ChatInputCommandInteraction) => {
    if(DEV_ENVIRONMENT && !interaction.commandName.startsWith("t_")) return;
    const i = commands.findIndex(v => v.definition.name == interaction.commandName);
    if(i == -1) return tagHandle(interaction);

    const r = commands[i].handle(interaction);
    if(r instanceof Promise) r.catch(DEFAULT_LOGGER.log);
}

export { registerCommands, commandHandler, registerTagCommand };