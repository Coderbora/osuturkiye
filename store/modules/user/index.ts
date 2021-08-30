import { Module } from "vuex";
import { RootState } from "../../store";

export interface UserState {
	user: IUserInformation,

	readonly isLogged: boolean,

}

const userModule: Module<UserState, RootState> = {
	namespaced: true,
	state() { //!!
		return {
			user: {} as IUserInformation
		}
	},
	mutations: {
		USER(state, value: IUserInformation) {
			state.user = value;
		}
	},
	actions: { 
		clearSession(ctx){
			ctx.commit('USER', {});
		},
		loadUserData(ctx, data) {
			ctx.commit('USER', data);
		},
		logout(ctx) {
			if(ctx.getters.isLogged()) {
				console.log();
			}
		}
	},
	getters: { 
		isLogged(state): boolean {
			return state.user.id !== undefined;
		}
	}
};


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

export { userModule };