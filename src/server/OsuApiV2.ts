import axios from 'axios';
import { ClientCredentials } from 'simple-oauth2';

import { App } from './App';

export class osuApiV2 {
    private options: {
        client: {
            id: string;
            secret: string;
        },
        auth: {
            tokenHost: string;
        }
    };

    constructor() {
        this.options = {
            client: {
                id: App.instance.config.osu.clientId,
                secret: App.instance.config.osu.clientSecret,
            },
            auth: {
                tokenHost: "https://osu.ppy.sh",
            },
        };
    }
  
    static async fetchUser(user, accessToken, gameMode) {
        return await this.request({
            endpoint: `${user ? `/users/${user}` : "/me"}${gameMode ? `/${gameMode}` : ""}`,
            accessToken,
        });
    }
  
    static async request({endpoint, accessToken}) {
        return (await axios(endpoint, {
            baseURL: "https://osu.ppy.sh/api/v2",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).data;
    }

    static async refreshAccessToken(refresh_token) {
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