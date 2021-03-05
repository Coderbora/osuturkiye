const axios = require('axios');
const { ClientCredentials } = require('simple-oauth2');

const config = require('../../config.json');

let mInstance = null;

class osuApiV2 {

    constructor() {
        this.options = {
            client: {
                id: config.osu.clientId,
                secret: config.osu.clientSecret,
            },
            auth: {
                tokenHost: "https://osu.ppy.sh",
            },
        };
        this.clientCredentials = new ClientCredentials(this.options);
    }
  
    async fetchUser(user, accessToken, gameMode) {
        return await this.request({
            endpoint: `${user ? `/users/${user}` : "/me"}${gameMode ? `/${gameMode}` : ""}`,
            accessToken,
        });
    }
  
    async request({endpoint, accessToken}) {
        return (await axios(endpoint, {
            baseURL: "https://osu.ppy.sh/api/v2",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).data;
    }

    async refreshAccessToken(refresh_token) {
        return (await axios({
            method: 'post',
            url: "https://osu.ppy.sh/oauth/token",
            data: {
                grant_type: 'refresh_token',
                refresh_token,
                client_id: config.osu.clientId,
                client_secret: config.osu.clientSecret,
            }
        })).data;
    }
}

module.exports = () => {
    if(mInstance == null)
        mInstance = new osuApiV2();
    return mInstance;
}