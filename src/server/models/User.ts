import mongoose from 'mongoose';
import { DateTime } from "luxon";

import { osuApiV2 as osuApi, CodeExchangeSchema, OUserSchema } from '../OsuApiV2';
import { App } from '../App';
import { DiscordAPIError } from "discord.js";
import { Logger } from "../Logger";

const logger = Logger.get("UserModel");

export interface IOsuInformation extends mongoose.Types.Subdocument {
    userId: number;
    playmode: string;
    groups: string[];
    isRankedMapper: boolean;
    username: string;
    accessToken: string;
    refreshToken: string;
    dateAdded: Date;
    lastVerified: Date;

    fetchUser(): Promise<void>;
}

export interface IDiscordInformation extends mongoose.Types.Subdocument {
    userId: string;
    userNameWithDiscriminator: string;
    accessToken: string;
    refreshToken: string;
    dateAdded: Date;
    lastUpdated: Date;

    updateUser(): Promise<void>;
    delink(): Promise<void>;
    availableDelinkDate(): DateTime | false;
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
    remainingDelinkTime?: number;
}

export interface IUser extends mongoose.Document {
    registration: Date;
    lastLogin: Date;
    discord?: IDiscordInformation;
    osu?: IOsuInformation;

    getInfos(): IUserInformation;
    updateUser(): Promise<void>;
    getUsername(): string;
}


const OsuInformationSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    playmode: { type: String, required: true },
    groups: { type: Array, default: [], required: true },
    isRankedMapper: { type: Boolean, default: false, required: true },
    username: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    dateAdded: { type: Date, default: DateTime.now().toJSDate(), required: true },
    lastVerified: { type: Date, default: DateTime.now().toJSDate(), required: true }
})

const DiscordInformationSchema = new mongoose.Schema({
    userId: String,
    userNameWithDiscriminator: String,
    accessToken: String,
    refreshToken: String,
    dateAdded: { type: Date, default: DateTime.now().toJSDate() },
    lastUpdated: { type: Date, default: DateTime.now().toJSDate() }
})

const UserSchema = new mongoose.Schema({
    registration: { type: Date, default: DateTime.now().toJSDate() },
    lastLogin: { type: Date, default: DateTime.now().toJSDate() },
    osu: OsuInformationSchema,
    discord: DiscordInformationSchema,
})

OsuInformationSchema.methods.fetchUser = async function(this: IOsuInformation): Promise<void> {
    if(-DateTime.fromJSDate(this.lastVerified, { zone: App.instance.config.misc.timezone }).diffNow("days").days >= 0.95) { // expires after one day
        try {
            const tokenRet = (await osuApi.refreshAccessToken(this.refreshToken)) as CodeExchangeSchema;
            this.accessToken = tokenRet.access_token;
            this.refreshToken = tokenRet.refresh_token;
            this.lastVerified = DateTime.now().setZone(App.instance.config.misc.timezone).toJSDate();
        } catch(err) {
            logger.error(`Failed to obtain new access token from user [${this.username}](https://osu.ppy.sh/users/${this.userId})`, err);
            return;
        }
    }
    const ret = await osuApi.fetchUser(undefined, this.accessToken, undefined) as OUserSchema
    this.username = ret.username;
    this.playmode = ret.playmode;
    this.groups = ret.groups.map(e => e["identifier"]);
    this.isRankedMapper = ret.ranked_and_approved_beatmapset_count > 0;
    await (this.ownerDocument() as mongoose.Document).save();
};

DiscordInformationSchema.methods.updateUser = async function(this: IDiscordInformation): Promise<void> {
    const discordMember = await App.instance.discordClient.fetchMember(this.userId, true);
    if(discordMember) {

        const addArray: string[] = [], removeArray: string[] = [];

        Object.keys(App.instance.config.discord.roles.groupRoles).forEach(async group => {
            if((this.ownerDocument() as IUser).osu?.groups.includes(group))
                addArray.push(App.instance.config.discord.roles.groupRoles[group]);
            else
                removeArray.push(App.instance.config.discord.roles.groupRoles[group]);
        });

        Object.keys(App.instance.config.discord.roles.playModeRoles).forEach(async playmode => {
            if((this.ownerDocument() as IUser).osu?.playmode == playmode)
                addArray.push(App.instance.config.discord.roles.playModeRoles[playmode]);
            else 
                removeArray.push(App.instance.config.discord.roles.playModeRoles[playmode]);
        });

        if ((this.ownerDocument() as IUser).osu?.isRankedMapper) 
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

        this.lastUpdated = DateTime.now().setZone(App.instance.config.misc.timezone).toJSDate();
        await (this.ownerDocument() as mongoose.Document).save();
    }
};

DiscordInformationSchema.methods.delink = async function(this: IDiscordInformation): Promise<void> {
    const discordMember = await App.instance.discordClient.fetchMember(this.userId, true);
    if(discordMember) {

        const removeArray = [App.instance.config.discord.roles.verifiedRole, App.instance.config.discord.roles.rankedMapper];

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

        this.lastUpdated = DateTime.now().setZone(App.instance.config.misc.timezone).toJSDate();
        await (this.ownerDocument() as mongoose.Document).save();
    }
}

DiscordInformationSchema.methods.availableDelinkDate = function(this: IDiscordInformation): DateTime | false {
    const availableDelinkDate = DateTime.fromJSDate(this.dateAdded, { zone: App.instance.config.misc.timezone }).plus(App.instance.config.misc.cooldownDuration);
    if(availableDelinkDate.diffNow().as("milliseconds") >= 0) {
        return availableDelinkDate;
    } else return false;
}

UserSchema.statics.serializeUser = function(user: IUser, done) {
    done(null, user && user.id ? user.id : null);
};

UserSchema.statics.deserializeUser = async function(id: string, done) {
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

UserSchema.methods.getInfos = function(this: IUser): IUserInformation {
    const userObj: IUserInformation = {
        id: this.id,
        lastLogin: this.lastLogin,
        avatar_url: `https://a.ppy.sh/${this.osu?.userId}?${Date.now()}`,
        osuID: this.osu ? this.osu.userId : undefined,
        username: this.osu ? this.osu.username : undefined,
        discordID: this.discord ? this.discord.userId : undefined,
        discordName: this.discord ? this.discord.userNameWithDiscriminator : undefined,
        osuLinked: this.osu != null,
        discordLinked: this.discord != null,
    };

    if(this.discord != null) {
        const availableDelinkDate = this.discord.availableDelinkDate();
        if(availableDelinkDate !== false) {
            userObj.remainingDelinkTime = availableDelinkDate.diffNow().as("milliseconds")
        }
    }
    
    return userObj;
}


UserSchema.methods.updateUser = async function(this: IUser): Promise<void> {
    try {
        await this.osu?.fetchUser();
        await this.discord?.updateUser();
        return;
    } catch(err) {
        logger.error(err);
    }
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