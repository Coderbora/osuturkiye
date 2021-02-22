const axios = require('axios');
const { ClientCredentials } = require('simple-oauth2');

let mInstance = null;

class osuApiV2 {
  constructor(clientId, clientSecret) {
      this.options = {
        client: {
          id: clientId,
          secret: clientSecret,
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
}

module.exports = (clientId='', clientSecret='') => {
  if(mInstance == null)
      mInstance = new osuApiV2(clientId, clientSecret);
  return mInstance;
}