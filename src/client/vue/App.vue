<template>
  <Header></Header>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script lang="ts">
import Header from './Header.vue';

export default {
    name: "App",
    components: {
        Header
    }
}
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