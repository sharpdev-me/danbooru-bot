import axios from "axios";
import { ChatInputCommandInteraction, Snowflake } from "discord.js";
import { DANBOORU_URL, DEFAULT_LOGGER, DEFAULT_SEARCH } from "./constants";
import { getGuildSettings } from "./database";

export type BooruTag = {
    id: number;
    name: string;
    post_count: number;
}

export const getTopTags = async (count: number): Promise<BooruTag[]> => {
    const response = await axios.get(
        DANBOORU_URL + `/tags.json?search[order]=count&limit=${count}`,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
    const list: BooruTag[] = response.data;
    list.push(
        {
            id: -1,
            name: "catgirl",
            post_count: 38784
        },
        {
            id: -1,
            name: "yuri",
            post_count: 130000
        }
    );

    return list;
}

export const getRandomImage = async (query: string, append: boolean, interaction: ChatInputCommandInteraction): Promise<{url: string, nsfw: boolean}> => {
    let qq = DEFAULT_SEARCH;
    if(interaction.guildId) {
        const settings = await getGuildSettings(interaction.guildId).catch(DEFAULT_LOGGER.log);
        if(!settings) throw new Error("getGuildSettings returned void");
        qq = settings.defaultSearch;

        const u = settings.channelDefaultSearches[interaction.channelId];
        if(u != null && u != undefined) qq = u;
    }
    
    const search = append ? qq + ` ${query}` : query || qq;
    return axios.get(
        DANBOORU_URL + `/posts/random.json?tags=${encodeURIComponent(search)}`,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    ).then(response => {
        return {
            url: response.data.file_url,
            nsfw: response.data.rating == "q" || response.data.rating == "e"
        };
    });
}