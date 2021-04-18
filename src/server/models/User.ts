import mongoose from 'mongoose';

import { osuApiV2 as osuApi } from '../OsuApiV2';
import { App } from '../App';
import { DiscordAPIError } from "discord.js";
import { Logger } from "../Logger";

const logger = Logger.get("UserModel");

export interface IOsuIntegration extends mongoose.Types.Subdocument {
    userId: number;
    playmode: string;
    groups: string[];
    isRankedMapper: boolean;
    username: string;
    accessToken: string;
    refreshToken: string;
    dateAdded: Date;
    lastVerified: Date;

    fetchUser(): void;
}

export interface IDiscordIntegration extends mongoose.Types.Subdocument {
    userId: string;
    userNameWithDiscriminator: string;
    accessToken: string;
    refreshToken: string;
    dateAdded: Date;
    lastUpdated: Date;

    updateUser(): void;
    delink(): Promise<void>;
}

export interface IUserModel extends mongoose.Model<IUser> {
    serializeUser: (user: IUser, done: (error: Error, number: number) => void) => void;
    deserializeUser: (id: number, done: (error: Error, user: IUser) => void) => void;
}

export interface IUserInformation {
    id: string;
    lastLogin: Date;
    avatar_url: string;
    osuID?: number,
    username?: string,
    discordID?: string;
    discordName?: string;
    osuLinked: boolean;
    discordLinked: boolean;
    availableDelinkDate?: number;
}

export interface IUser extends mongoose.Types.Subdocument {
    registration: Date;
    lastLogin: Date;
    discord?: IDiscordIntegration;
    osu?: IOsuIntegration;

    getInfos(): Promise<IUserInformation>;
    updateUser(): Promise<void>;
    getUsername(): string;
}


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
    discord: DiscordInformationSchema,
})

OsuInformationSchema.methods.fetchUser = async function(this: IOsuIntegration): Promise<void> {
    if(Date.now() - this.lastVerified.getTime() > 86400000) { // expires after one day
        const tokenRet = await osuApi.refreshAccessToken(this.refreshToken);
        this.accessToken = tokenRet.access_token;
        this.refreshToken = tokenRet.refresh_token;
        this.lastVerified = new Date();
    }

    const ret = await osuApi.fetchUser(null, this.accessToken, null)
    this.username = ret.username;
    this.playmode = ret.playmode;
    this.groups = ret.groups.map(e => e["identifier"]);
    this.isRankedMapper = ret.ranked_and_approved_beatmapset_count > 0;
    await (this.ownerDocument()).save();
};

DiscordInformationSchema.methods.updateUser = async function(this: IDiscordIntegration): Promise<void> {
    let discordMember = await App.instance.discordClient.fetchMember(this.userId, true);
    if(discordMember) {

        let addArray = [], removeArray = [];

        Object.keys(App.instance.config.discord.roles.groupRoles).forEach(async group => {
            if((this.ownerDocument() as IUser).osu.groups.includes(group))
                addArray.push(App.instance.config.discord.roles.groupRoles[group]);
            else
                removeArray.push(App.instance.config.discord.roles.groupRoles[group]);
        });

        Object.keys(App.instance.config.discord.roles.playModeRoles).forEach(async playmode => {
            if((this.ownerDocument() as IUser).osu.playmode == playmode)
                addArray.push(App.instance.config.discord.roles.playModeRoles[playmode]);
            else 
                removeArray.push(App.instance.config.discord.roles.playModeRoles[playmode]);
        });

        if ((this.ownerDocument() as IUser).osu.isRankedMapper) 
            addArray.push(App.instance.config.discord.roles.rankedMapper);
        else
            removeArray.push(App.instance.config.discord.roles.rankedMapper);

        addArray.push(App.instance.config.discord.roles.verifiedRole);
    
        try{ //in case of permission error during updating
            await discordMember.roles.remove(removeArray);
            await discordMember.roles.add(addArray);

            await discordMember.setNickname((this.ownerDocument() as IUser).getUsername());
        } catch(err) {
            if(!(err instanceof DiscordAPIError && err.code === 50013))
            throw err;
        }

        this.lastUpdated = new Date();
        await (this.ownerDocument()).save();
    }
};

DiscordInformationSchema.methods.delink = async function(this: IDiscordIntegration): Promise<void> {
    let discordMember = await App.instance.discordClient.fetchMember(this.userId, true);
    if(discordMember) {

        let removeArray = [App.instance.config.discord.roles.verifiedRole, App.instance.config.discord.roles.rankedMapper];

        Object.keys(App.instance.config.discord.roles.groupRoles).forEach(async group => {
            removeArray.push(App.instance.config.discord.roles.groupRoles[group]);
        });
        Object.keys(App.instance.config.discord.roles.playModeRoles).forEach(async playmode => {
            removeArray.push(App.instance.config.discord.roles.playModeRoles[playmode]);
        });
    
        try{ //in case of permission error during updating
            await discordMember.roles.remove(removeArray);
            await discordMember.setNickname("");
        } catch(err) {
            if(!(err instanceof DiscordAPIError && err.code === 50013))
            throw err;
        }

        this.lastUpdated = new Date();
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

UserSchema.methods.getInfos = async function(this: IUser): Promise<IUserInformation> {
    return {
        id: this.id,
        lastLogin: this.lastLogin,
        avatar_url: `https://a.ppy.sh/${this.osu.userId}?${Date.now()}`,
        osuID: this.osu ? this.osu.userId : null,
        username: this.osu ? this.osu.username : null,
        discordID: this.discord ? this.discord.userId : null,
        discordName: this.discord ? this.discord.userNameWithDiscriminator : null,
        osuLinked: this.osu != null,
        discordLinked: this.discord != null,
        availableDelinkDate: this.discord != null && (Date.now() - this.discord.dateAdded.getTime()) < 86400000 ? this.discord.dateAdded.setDate(this.discord.dateAdded.getDate() + 1) : null
    }
}


UserSchema.methods.updateUser = function(this: IUser): Promise<void> {
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

UserSchema.methods.getUsername = function(this: IUser): string {
    if(this.osu && this.osu.username)
        return this.osu.username;
    else if(this.discord && this.discord.userNameWithDiscriminator)
        return this.discord.userNameWithDiscriminator;
    else
        return "UNKNOWN";
}

export const User: IUserModel = (mongoose.model<IUser>("User", UserSchema) as IUserModel);