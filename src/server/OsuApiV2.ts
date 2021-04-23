import axios from 'axios';
import { App } from './App';


export interface CodeExchangeSchema {
    token_type: "Bearer",
    expires_in: number,
    access_token: string,
    refresh_token: string,
}

export interface OUserGroupSchema {
    id: number,
    identifier: string,
    name: string,
    short_name: string,
    description: string,
    colour: string
}

export interface OUserSchema {
    avatar_url: string,
    username: string,
    playmode: "osu" | "mania" | "fruits" | "taiko",
    groups: OUserGroupSchema[],
    ranked_and_approved_beatmapset_count: number
}

export class osuApiV2 {

    static async fetchUser(user?: string, accessToken?: string, gameMode?: string): Promise<unknown> {
        return await this.request({
            endpoint: `${user ? `/users/${user}` : "/me"}${gameMode ? `/${gameMode}` : ""}`,
            accessToken,
        });
    }
  
    static async request({endpoint, accessToken}: { endpoint: string; accessToken?: string }): Promise<unknown> {
        return (await axios(endpoint, {
            baseURL: "https://osu.ppy.sh/api/v2",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).data;
    }

    static async refreshAccessToken(refresh_token: string): Promise<unknown> {
        return (await axios({
            method: 'post',
            url: "https://osu.ppy.sh/oauth/token",
            data: {
                grant_type: 'refresh_token',
                refresh_token,
                client_id: App.instance.config.osu.clientId,
                client_secret: App.instance.config.osu.clientSecret,
            }
        })).data;
    }
}