import { Client } from "discord.js";
import { commandHandler, registerCommands } from "./commands/commands";
import { BOT_TOKEN, CURRENT_VERSION, DEV_ENVIRONMENT, DEV_SERVER, DEFAULT_LOGGER, PURGE_CACHE_TIMER } from "./constants";
import { getClient, purgeCache } from "./database";

const client = new Client({
    intents: ["DirectMessages","DirectMessageTyping","DirectMessageReactions","GuildMessages","GuildMessageTyping","GuildMessageReactions"]
});

client.on("ready", () => {
    console.log("DanBooru bot online. Version v" + CURRENT_VERSION);
    DEFAULT_LOGGER.log("DanBooru bot online. Version v" + CURRENT_VERSION);

    if(DEV_ENVIRONMENT) {
        console.log("Current test server: " + DEV_SERVER);
    }
});

client.on("interactionCreate", (interaction) => {
    if(interaction.isChatInputCommand()) return commandHandler(interaction);
});

registerCommands().then(() => {
    setInterval(purgeCache, PURGE_CACHE_TIMER);
    return getClient();
}).then(() => {
    return client.login(BOT_TOKEN);
}).catch(DEFAULT_LOGGER.log);