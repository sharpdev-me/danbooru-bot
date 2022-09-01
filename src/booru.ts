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
    return response.data && [
        {
            id: -1,
            name: "catgirl",
            post_count: 38784
        }
    ];
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
        return response.data.file_url
    });
}