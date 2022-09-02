import { Client } from "discord.js";
import { FileLogger, ConsoleLogger } from "./logging";

export const CURRENT_VERSION = "1.0.0";

// do something about this if I ever need to shard
export const GUILD_COUNT = (client: Client): number => {
    return client.guilds.cache.size;
}

export const APPLICATION_ID: string = "1014492013011406948";

export const BOT_TOKEN: string = process.env.DANBOORU_TOKEN!;

export const DEFAULT_SEARCH = "-status:deleted rating:g filetype:png,jpg score:>5 favcount:>10";

export const DANBOORU_URL = "https://danbooru.donmai.us";

export const DEV_SERVER = process.env.DANBOORU_TEST_SERVER;

export const DEV_ENVIRONMENT = DEV_SERVER != undefined;

export const DEFAULT_LOGGER = DEV_ENVIRONMENT ? new ConsoleLogger() : new FileLogger(process.env.DANBOORU_LOGFILE || (__dirname + "/log.log"));

export const MONGO_URI = process.env.DANBOORU_MONGODB || "";

// five minutes
export const PURGE_CACHE_TIMER = 1000 * 60 * 5;