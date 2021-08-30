import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { userModule, UserState } from "./modules/user";

export interface RootState {
  userModule: UserState
}

export const key: InjectionKey<Store<RootState>> = Symbol()

export const store = createStore<RootState>({
  modules: {
    userModule
  }
})

export function useStore(): Store<RootState> {
  return baseUseStore(key)
}