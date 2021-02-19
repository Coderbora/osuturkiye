const axios = require('axios');
const { ModuleOptions, ClientCredentials, AccessToken, AuthorizationCode } = require('simple-oauth2');

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
  
    getAuthorizationCodeInstance() {
      return new AuthorizationCode(this.options);
    }
  
    async fetchUser(user, accessToken, gameMode) {
      return await this.request({
        endpoint: `${user ? `/users/${user}` : "/me"}${gameMode ? `/${gameMode}` : ""}`,
        accessToken,
      });
    }
  
    async request({endpoint, accessToken}) {
      if(!accessToken)
        accessToken = (await this.getClientAccessToken()).token.access_token;
  
      return (await axios(endpoint, {
        baseURL: "https://osu.ppy.sh/api/v2",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })).data;
    }
  
    async getClientAccessToken() {
      if(!this.currentClientAccessToken || this.currentClientAccessToken.expired(300)) {
        if(!this.clientAccessTokenFetchPromise)
          this.clientAccessTokenFetchPromise = new Promise((resolve, reject) => {
            this.clientCredentials.getToken({ scope: "public" })
              .then(token => {
                this.currentClientAccessToken = token;
                this.clientAccessTokenFetchPromise = undefined;
                resolve();
              })
              .catch(reject);
          });
        await this.clientAccessTokenFetchPromise;
      }
      return this.currentClientAccessToken;
    }
  
}

module.exports = (clientId='', clientSecret='') => {
  if(mInstance == null)
      mInstance = new osuApiV2(clientId, clientSecret);
  return mInstance;
}