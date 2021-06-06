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