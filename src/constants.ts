import { Client } from "discord.js";
import { FileLogger } from "./logging";

export const CURRENT_VERSION = "1.0.0";

// do something about this if I ever need to shard
export const GUILD_COUNT = (client: Client): number => {
    return client.guilds.cache.size;
}

export const APPLICATION_ID: string = "1014492013011406948";

export const BOT_TOKEN: string = process.env.DANBOORU_TOKEN!;

export const DEFAULT_SEARCH = "-status:deleted rating:g filetype:png,jpg score:>5 favcount:>10";

export const DANBOORU_URL = "https://danbooru.donmai.us";

export const FILE_LOGGER = new FileLogger("log.log");