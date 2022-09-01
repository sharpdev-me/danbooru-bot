import { ChatInputCommandInteraction, MessageContextMenuCommandInteraction, REST, Routes } from "discord.js";
import { getRandomImage, getTopTags } from "../booru";
import { APPLICATION_ID, BOT_TOKEN, FILE_LOGGER } from "../constants";

import AboutCommand from "./about_command";
import BaseCommand from "./base_command";
import RandomCommand from "./random_command";
import TagCommand from "./tag_command";

const rest = new REST({version: "10"}).setToken(BOT_TOKEN);

const commands: BaseCommand[] = [
    new AboutCommand(),
    new RandomCommand(),
];

const validationRegex = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

const registerCommands = () => {
    return getTopTags(50).then(tags => {
        for (const tag of tags) {
            if(tag.name == "random" || tag.name == "about") continue;
            if(!validationRegex.test(tag.name)) continue;
    
            commands.push(new TagCommand(tag));
        }
    }).then(() => {
        return rest.put(Routes.applicationCommands(APPLICATION_ID), {
            body: commands.map(c => c.definition)/* && [
                {
                    type: 3,
                    name: "Random Image"
                }
            ]*/ // there's some crazy issue happening here where the channel isn't in the cache
        });
    });
}

const commandHandler = (interaction: ChatInputCommandInteraction) => {
    const i = commands.findIndex(v => v.definition.name == interaction.commandName);
    if(i == -1) return;

    commands[i].handle(interaction);
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