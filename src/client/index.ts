import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router';
import App from './vue/App.vue';

import Error from './vue/Error.vue';
import Home from './vue/Home.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Home },
        { path: '/:pathMatch(.*)*', component: Error }
    ]
});

const app = createApp(App);
app.use(router);

app.mount('#app');