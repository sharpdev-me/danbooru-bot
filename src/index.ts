import { Client } from "discord.js";
import { commandHandler, messageHandler, registerCommands } from "./commands/commands";
import { BOT_TOKEN, CURRENT_VERSION, DEV_ENVIRONMENT, DEV_SERVER, FILE_LOGGER } from "./constants";

const client = new Client({
    intents: ["DirectMessages","DirectMessageTyping","DirectMessageReactions","GuildMessages","GuildMessageTyping","GuildMessageReactions"]
});

client.on("ready", () => {
    console.log("DanBooru bot online. Version v" + CURRENT_VERSION);
    FILE_LOGGER.log("DanBooru bot online. Version v" + CURRENT_VERSION);

    if(DEV_ENVIRONMENT) {
        console.log("Current test server: " + DEV_SERVER);
    }
});

client.on("interactionCreate", (interaction) => {
    if(interaction.isChatInputCommand()) return commandHandler(interaction);
    if(interaction.isMessageContextMenuCommand()) return messageHandler(interaction);
});

registerCommands().then(() => {
    return client.login(BOT_TOKEN);
}).catch(FILE_LOGGER.log);