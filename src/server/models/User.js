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
    if(Date.now() - this.lastVerified > 86400) { // expires after one day
        const tokenRet = await osuApi.refreshAccessToken(this.refreshToken);
        this.accessToken = tokenRet.access_token;
        this.refreshToken = tokenRet.refresh_token;
        this.lastVerified = Date.now();
    }

    const ret = await osuApi.fetchUser(null, this.accessToken, null)
    this.username = ret.username;
    this.playmode = ret.playmode;
    this.groups = ret.groups.map(e => e["identifier"]);
    this.isRankedMapper = ret.ranked_and_approved_beatmapset_count > 0;
    await (this.ownerDocument()).save();
};

DiscordInformationSchema.methods.updateUser = async function() {
    let discordMember = await DiscordClient.fetchMember(this.userId);
    if(discordMember) {

        let addArray, removeArray = [];

        Object.keys(config.discord.roles.groupRoles).forEach(async group => {
            if(this.ownerDocument().osu.groups.includes(group))
                addArray.push(config.discord.roles.groupRoles[group]);
            else
                removeArray.push(config.discord.roles.groupRoles[group]);
        });

        Object.keys(config.discord.roles.playModeRoles).forEach(async playmode => {
            if(this.ownerDocument().osu.playmode == playmode)
                addArray.push(config.discord.roles.playModeRoles[playmode]);
            else 
                removeArray.push(config.discord.roles.playModeRoles[playmode]);
        });

        if (this.ownerDocument().osu.isRankedMapper) 
            addArray.push(config.discord.roles.rankedMapper);
        else
            removeArray.push(config.discord.roles.rankedMapper);

        addArray.push(config.discord.roles.verifiedRole);
    
        try{ //in case of permission error during updating
            await discordMember.roles.remove(removeArray);
            await discordMember.roles.add(addArray);

            await discordMember.setNickname(this.ownerDocument().getUsername());
        } catch(err) {
            if(!(err instanceof DiscordAPIError && err.code === 50013))
            throw err;
        }

        this.lastUpdated = Date.now();
        await (this.ownerDocument()).save();
    }
};

DiscordInformationSchema.methods.delink = async function() {
    let discordMember = await DiscordClient.fetchMember(this.userId);
    if(discordMember) {
        Object.keys(config.discord.roles.groupRoles).forEach(async group => {
            await discordMember.roles.remove(config.discord.roles.groupRoles[group]);
        });
        Object.keys(config.discord.roles.playModeRoles).forEach(async playmode => {
            await discordMember.roles.remove(config.discord.roles.playModeRoles[playmode]);
        });

        await discordMember.roles.remove([config.discord.roles.verifiedRole, config.discord.roles.rankedMapper]);
    
        try{ //in case of permission error during updating
            await discordMember.setNickname("");
        } catch(err) {
            if(!(err instanceof DiscordAPIError && err.code === 50013))
            throw err;
        }

        this.lastUpdated = Date.now();
        await (this.ownerDocument()).save();
    }
}

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


UserSchema.methods.updateUser = function() {
    return new Promise(async (resolve, reject) => {
        try {
            await this.osu.fetchUser();
            await this.discord.updateUser();
            resolve();
        } catch(err) {
            reject(err);
        }
    })
}

UserSchema.methods.getUsername = function() {
    if(this.osu && this.osu.username)
        return this.osu.username;
    else if(this.discord && this.discord.userNameWithDiscriminator)
        return this.discord.userNameWithDiscriminator;
    else
        return "UNKNOWN";
}

const User = mongoose.model('User', UserSchema)
module.exports = {User}