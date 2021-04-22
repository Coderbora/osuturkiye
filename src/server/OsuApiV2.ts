import axios from 'axios';
import { App } from './App';

export class osuApiV2 {

    static async fetchUser(user?: string, accessToken?: string, gameMode?: string) {
        return await this.request({
            endpoint: `${user ? `/users/${user}` : "/me"}${gameMode ? `/${gameMode}` : ""}`,
            accessToken,
        });
    }
  
    static async request({endpoint, accessToken}: { endpoint: string; accessToken?: string }) {
        return (await axios(endpoint, {
            baseURL: "https://osu.ppy.sh/api/v2",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).data;
    }

    static async refreshAccessToken(refresh_token: string) {
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