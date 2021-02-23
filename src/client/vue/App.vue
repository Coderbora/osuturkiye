<template>
    <div class="container">
        <div class="landing">
            <!--<div class="logo"></div>-->
            <div class="header">
                <span>osu!</span>türkiye
            </div>
            <p>osu! hesabınız ile Discord hesabınızı bağlayın!</p>
            <div class="actionbar">
                <button :disabled="user.osuLinked" @click="connectOsuAccount()">
                    <template v-if="!user.osuLinked">
                        <i id="osu" class="fas fa-circle"></i> osu!
                    </template>
                    <template v-else>
                        <i id="osu" class="fa fa-check"></i> {{ user.username }}
                    </template>
                </button>
                <i class="between fas fa-plus"></i>
                <button :disabled="!user.osuLinked && !user.discordLinked">
                    <i id="discord" class="fab fa-discord"></i> Discord
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import axios from "axios";
import regeneratorRuntime from "regenerator-runtime";

export default {
    name: "App",
    data: () => { return {
        user: {
            osuLinked: false,
            discordLinked: false
        }
    }},
    methods: {
        reloadData() {
            axios.get("/api/user").then(res => {
                let data = res.data.user;
                if(data) {
                    this.user = data;
                }
            })
        },
        connectOsuAccount() {
            if(!this.user.osuLinked) {
                let icon = document.getElementById("osu")
                icon.classList.remove("fa-circle");
                icon.classList.add("fa-spinner");
                icon.classList.add("fa-spin");

                window.location.href = "/api/auth/osu"
            }
        }
    },
    mounted() {
        this.reloadData();
    }
}
</script>

<style>
html, body {
    height: 100%;
    margin: 0;
    color: white;
}

html {
    background: linear-gradient(45deg, #dd1818, #333333);
}

span {
    font-weight: 600;
}

.container {
    min-height: 100%;
}

.landing {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    font-size: 16pt;
}

.header {
    font-size: 46pt;
}

.between {
    margin: 0px 15px;
}

button {
    cursor: pointer;
    transition: all .5s ease;
    color: #fff;
    border: 2px solid white;
    font-family: 'Comfortaa', cursive;
    text-align: center;
    line-height: 1;
    font-size: 20px;
    background-color : transparent;
    padding: 10px;
    outline: none;
    border-radius: 4px;
}
button:hover {
    color: #001F3F;
    background-color: #fff;
}

button:disabled,
button[disabled]{
    cursor: default;
    pointer-events: none;
    filter: blur(2px);
}
</style>