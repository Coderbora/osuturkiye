<template>
  <Header :isLogged="isLogged" :user="user" ></Header>
  <router-view v-slot="{ Component, route }" >
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :isLogged="isLogged" :user="user" />
    </transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { IUserInformation } from './types/IUser';

import Header from './Header.vue';

export default defineComponent({
    name: "App",
    data() {
      return {
        isLogged: false,
        user: {} as IUserInformation
      }
    },
    components: {
        Header
    },
    mounted() {
      this.refresh();
    },
    methods: {
      refresh: async function() {
        this.isLogged = false;
        const user = (await axios.get("/api/user")).data.user;
        if(user) {
          this.user = user;
          this.isLogged = true;
        }
      }
    }
})


</script>

<style>
.section-card {
  border-radius: 20px;
  background: #202020;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .15s ease-in-out;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>