const mongoose = require('mongoose');
const { ErrorCode } = require('./ErrorCodes.js');
const osuApi = require('../OsuApiV2.js')();

const OsuInformationSchema = new mongoose.Schema({
    userId: Number,
    playmode: String,
    username: String,
    accessToken: String,
    refreshToken: String,
    dateAdded: { type: Date, default: Date.now() },
    lastVerified: { type: Date, default: Date.now() }
})

const DiscordInformationSchema = new mongoose.Schema({
    userId: String,
    accessToken: String,
    refreshToken: String,
    dateAdded: Date,
    lastVerified: Date
})

const UserSchema = new mongoose.Schema({
    registration: { type: Date, default: Date.now() },
    lastLogin: { type: Date, default: Date.now() },
    osu: OsuInformationSchema,
    discord: DiscordInformationSchema
})

OsuInformationSchema.methods.fetchUser = async function() {
    const ret = await osuApi.fetchUser(null, this.accessToken, null)
    this.username = ret.username;
    this.playmode = ret.playmode;
    await (this.ownerDocument()).save();
};

UserSchema.statics.serializeUser = function(user, done) {
    done(null, user && user.id ? user.id : null);
};

UserSchema.statics.deserializeUser = async function(id, done) {
    try {
        let user = null;
        if(id)
            user = await User.findById(id);
        done(null, user);
    } catch(error) {
        logger.error("Error while deserializing user", { error });
        done(error, null);
    }
};

UserSchema.methods.getInfos = async function() {
    await this.osu.fetchUser();
    return {
        id: this.id,
        lastLogin: this.lastLogin,
        avatar_url: `https://a.ppy.sh/${this.osu.userId}?${Date.now()}`,
        osuID: this.osu ? this.osu.userId : null,
        username: this.osu ? this.osu.username : null,
        discordID: this.discord ? this.discord.userId : null,
        osuLinked: this.osu != null,
        discordLinked: this.discord != null
    }
}


UserSchema.methods.getAvatarUrl = async function(discordAvatarId) {

}

const User = mongoose.model('User', UserSchema)
module.exports = {User}