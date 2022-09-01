import { ChatInputCommandInteraction } from "discord.js";
import { FILE_LOGGER } from "../constants";
import BaseCommand from "./base_command";

class HelpCommand extends BaseCommand {
    constructor() {
        super({
            name: "help",
            description: "Briefly tells you how to use the bot."
        });
    }

    public handle = (interaction: ChatInputCommandInteraction) => {
        interaction.reply("Hey there! Thanks for using my bot! If you're just looking for a quick guide on searching, you can look here https://danbooru.donmai.us/wiki_pages/help:cheatsheet \n"
            + "The \"append\" option in the \"/render\" command specifies whether or not your query is added to the default search query. The \"private\" option makes your commands visible only to you.\n"
            + "If you have any more questions, you can shoot me a message on Discord (SharpDev#1101).").catch(FILE_LOGGER.log);
    }
}

export default HelpCommand;