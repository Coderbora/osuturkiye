const mongoose = require('mongoose');

const config = require('../../../config.json');
const osuApi = require('../OsuApiV2.js')();
const DiscordClient = require('../DiscordClient.js')();
const { DiscordAPIError } = require("discord.js");

const OsuInformationSchema = new mongoose.Schema({
    userId: Number,
    playmode: String,
    groups: { type: Array, default: [] },
    isRankedMapper: { type: Boolean, default: false },
    username: String,
    accessToken: String,
    refreshToken: String,
    dateAdded: { type: Date, default: Date.now() },
    lastVerified: { type: Date, default: Date.now() }
})

const DiscordInformationSchema = new mongoose.Schema({
    userId: String,
    userNameWithDiscriminator: String,
    accessToken: String,
    refreshToken: String,
    dateAdded: { type: Date, default: Date.now() },
    lastUpdated: { type: Date, default: Date.now() }
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
    this.groups = ret.groups;
    this.isRankedMapper = ret.ranked_and_approved_beatmapset_count > 0;
    await (this.ownerDocument()).save();
};

DiscordInformationSchema.methods.updateUser = async function() {
    let discordMember = await DiscordClient.fetchMember(this.userId);
    if(discordMember) {
        Object.keys(config.discord.roles.groupRoles).forEach(async group => {
            if(this.ownerDocument().osu.groups.includes(group))
                await discordMember.roles.add(config.discord.roles.groupRoles[group]);
            else
                await discordMember.roles.remove(config.discord.roles.groupRoles[group]);
        });

        Object.keys(config.discord.roles.playModeRoles).forEach(async playmode => {
            if(this.ownerDocument().osu.playmode == playmode)
                await discordMember.roles.add(config.discord.roles.playModeRoles[playmode]);
            else 
                await discordMember.roles.remove(config.discord.roles.playModeRoles[playmode]);
        });

        if (this.ownerDocument().osu.isRankedMapper) 
            await discordMember.roles.add(config.discord.roles.rankedMapper);
        else
            await discordMember.roles.remove(config.discord.roles.rankedMapper);
    
        try{ //in case of permission error during updating
            await discordMember.setNickname(this.ownerDocument().osu.username);
        } catch(err) {
            if(!(err instanceof DiscordAPIError && err.code === 50013))
            throw err;
        }

        this.lastUpdated = Date.now();
        await (this.ownerDocument()).save();
    }
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
        discordName: this.discord ? this.discord.userNameWithDiscriminator : null,
        osuLinked: this.osu != null,
        discordLinked: this.discord != null
    }
}


UserSchema.methods.getAvatarUrl = async function(discordAvatarId) {

}

const User = mongoose.model('User', UserSchema)
module.exports = {User}