import { ChatInputCommandInteraction, MessageContextMenuCommandInteraction, REST, Routes } from "discord.js";
import { getRandomImage, getTopTags } from "../booru";
import { APPLICATION_ID, BOT_TOKEN, DEV_ENVIRONMENT, DEV_SERVER, FILE_LOGGER } from "../constants";

import AboutCommand from "./about_command";
import BaseCommand from "./base_command";
import HelpCommand from "./help_command";
import RandomCommand from "./random_command";
import TagCommand from "./tag_command";

const rest = new REST({version: "10"}).setToken(BOT_TOKEN);

const commands: BaseCommand[] = [
    new AboutCommand(),
    new RandomCommand(),
    new HelpCommand(),
];

const validationRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

const registerCommands = () => {
    return getTopTags(50).then(tags => {
        for (const tag of tags) {
            if(commands.findIndex(v => v.definition.name == tag.name) != -1) continue;
            if(!validationRegex.test(tag.name)) continue;
    
            commands.push(new TagCommand(tag));
        }
    }).then(() => {
        if(DEV_ENVIRONMENT) {
            const definitions = commands.map(c => c.definition);
            definitions.forEach((v, i, a) => {
                a[i].name = "t_" + v.name;
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

const commandHandler = (interaction: ChatInputCommandInteraction) => {
    const i = commands.findIndex(v => v.definition.name == interaction.commandName);
    if(i == -1) return;

    const r = commands[i].handle(interaction);
    if(r instanceof Promise) r.catch(console.error);
}

const messageHandler = (interaction: MessageContextMenuCommandInteraction) => {
    if(interaction.commandName == "Random Image") {
        getRandomImage("", true).then(async url => {
            await interaction.deferReply({
                ephemeral: true
            });
            
            // for some reason, the channel here isn't in the cache when we try to reply to it
            const message = await interaction.targetMessage.fetch(true);
            return message.reply({
                files: [
                    url
                ]
            });
        }).catch(error => {
            FILE_LOGGER.log(error);
            if(error.response) {
                return interaction.followUp("There was an error getting the response from DanBooru.").catch(FILE_LOGGER.log);
            } else if(error.request) {
                return interaction.followUp("There was an error making the request to DanBooru.").catch(FILE_LOGGER.log);
            } else {
                console.dir(error);
                return interaction.followUp("An unknown error has occurred.").catch(FILE_LOGGER.log);
            }
        })
    }
}

export { registerCommands, commandHandler, messageHandler };