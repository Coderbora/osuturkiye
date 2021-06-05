<template>
    <div class="container-fluid py-3">
        <div class="section-card navbar-section">
            <nav class="navbar navbar-dark navbar-expand-sm">
                <a class="navbar-brand" href="#">osu!türkiye</a>
                <ul class="navbar-nav d-flex flex-grow-1 me-auto">
                    <li class="nav-item"><router-link active-class="active" class="nav-link" to="/">Home</router-link></li>
                    <li class="nav-item"><router-link active-class="active" class="nav-link" to="/about">About</router-link></li>
                    <li class="nav-item"><router-link active-class="active" class="nav-link" to="/events">Events</router-link></li>
                </ul>
                <div class="navbar-nav d-flex ms-auto">
                    <div v-if="isLogged" class="userModal"> {{ user.username }} </div>
                    <div v-else class="loginButton"><a href="/api/auth/osu" class="nav-link">LOGIN</a></div>
                </div>
            </nav>
        </div>
    </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { IUserInformation } from "./types/IUser";

export default defineComponent({
    name: "Header",
    props: {
        isLogged: Boolean,
        user: Object as PropType<IUserInformation>
    }
})
</script>

<style scoped>
.navbar-section {
    background: linear-gradient(90deg, #202020, #3d0000);
    padding: 1vw 5vw;
}

.navbar-brand {
    font-family: 'Comfortaa', cursive;
    font-weight: 800;
    margin-right: 3rem;
}

.nav-link {
    text-transform: uppercase;
    font-weight: 600;
}

.navbar-dark .navbar-nav .nav-link {
	color: rgba(255,255,255,.55);
}

.navbar-dark .navbar-nav .nav-link.nav-link:hover {
	color: rgba(255,255,255,1);
}

.navbar-dark .navbar-nav .nav-link.nav-link.active {
	color: rgba(255,255,255,1);
}

</style>