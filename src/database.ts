import { Snowflake } from "discord.js";
import { Db, MongoClient } from "mongodb";
import { BooruTag } from "./booru";
import { DEFAULT_SEARCH, MONGO_URI } from "./constants";

const v: any = {};

let guildSettingsCache: {[key: Snowflake]: GuildSettings} = {};

export type GuildSettings = {
    guildID: Snowflake;
    defaultSearch: string;
    whitelistNSFW: boolean;
    nsfwChannels: Snowflake[];
    channelDefaultSearches: {[key: Snowflake]: string | null};
}

export const defaultGuildSettings = (guildID: Snowflake): GuildSettings => {
    return {
        guildID: guildID,
        defaultSearch: DEFAULT_SEARCH,
        whitelistNSFW: true,
        nsfwChannels: [],
        channelDefaultSearches: {}
    };
}

export function purgeCache() {
    guildSettingsCache = {};
}

export async function getClient(): Promise<MongoClient> {
    if(v.client) return v.client;

    v.client = new MongoClient(MONGO_URI);
    return v.client;
}

export function getDatabaseSync(database = "danbooru"): Db {
    if(v.database) return v.database;
    if(v.client) {
        v.database = v.client.db(database);
        return v.database;
    }
    throw new Error("client not yet initialized");
}

export async function getGuildSettings(guildID: Snowflake): Promise<GuildSettings> {
    if(guildSettingsCache[guildID] != undefined) return guildSettingsCache[guildID];
    const db = getDatabaseSync();
    const ru = await db.collection("guild_settings").findOne({ guildID: guildID });

    // typescript
    let r = ru as any as GuildSettings;
    if (r == null) r = defaultGuildSettings(guildID);

    guildSettingsCache[guildID] = r;
    return r;
}

export function saveGuildSettings(settings: GuildSettings) {
    const db = getDatabaseSync();

    // let's update the cache here just in case we aren't using a reference
    guildSettingsCache[settings.guildID] = settings;
    return db.collection("guild_settings").replaceOne({guildID: settings.guildID}, settings, {
        upsert: true
    });
}