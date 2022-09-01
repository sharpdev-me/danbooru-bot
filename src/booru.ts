import axios from "axios";
import { DANBOORU_URL, DEFAULT_SEARCH } from "./constants";

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

export const getRandomImage = async (query: string, append: boolean): Promise<string> => {
    const search = append ? DEFAULT_SEARCH + ` ${query}` : query || DEFAULT_SEARCH;
    return axios.get(
        DANBOORU_URL + `/posts/random.json?tags=${encodeURIComponent(search)}`,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    ).then(response => {
        return response.data.file_url;
    });
}