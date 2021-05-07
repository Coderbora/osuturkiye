<template>
    <div class="container">
        <div class="landing">
            <!--<div class="logo"></div>-->
            <div class="header">
                <span>osu!</span>türkiye
            </div>
            <p>osu! hesabınız ile Discord hesabınızı bağlayın!</p>
            <div class="actionbar">
                <div class="actionBtn">
                    <button @click="osuAction()">
                        <template v-if="!user.osuLinked">
                            <i id="osu" class="fas fa-circle"></i> osu!
                        </template>
                        <template v-else>
                            <i id="osu" class="fa fa-check"></i> {{ user.username }}
                        </template>
                    </button>
                    <p class="alt" v-if="!user.osuLinked">LOG IN</p>
                    <p class="alt" v-else>LOG OUT</p>
                </div>
                <i class="between fas fa-plus"></i>
                <div class="actionBtn">
                    <button :disabled="(!user.osuLinked && !user.discordLinked) || (user.discordLinked && user.remainingDelinkTime != undefined)" @click="discordAction()">
                        <template v-if="!user.discordLinked">
                            <i id="discord" class="fab fa-discord"></i> Discord
                        </template>
                        <template v-else>
                            <i id="discord" class="fa fa-check"></i> {{ user.discordName }}
                        </template>
                    </button>
                    <p class="alt" v-if="!user.discordLinked">LINK</p>
                    <p class="alt" v-if="user.discordLinked && !user.deadlineDate">DELINK</p>
                    <p class="alt" v-if="user.deadlineDate"><Timer :deadline="user.deadlineDate"></Timer></p>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import axios from "axios";

import Timer from "./components/Timer.vue";

interface UserDetails {
    id: string,
    lastLogin: Date,
    avatar_url: string,
    osuID?: number,
    username?: string,
    discordID?: string,
    discordName?: string,
    osuLinked: boolean,
    remainingDelinkTime?: number,
    discordLinked: boolean,
    deadlineDate: number
}

export default {
    name: "App",
    components: {
        Timer
    },
    data() { return {
        user: <UserDetails>{},
        defaultUser: {
            osuLinked: false,
            discordLinked: false,
            deadlineDate: null
        }
    }},
    methods: {
        async reloadData(): Promise<void> {
            let res = await axios.get("/api/user");
            let data = (res.data.user) as UserDetails;
            if(data) {
                const now = new Date();
                this.user = data;
                if(data.remainingDelinkTime)
                    this.user.deadlineDate = now.setMilliseconds(now.getMilliseconds() + data.remainingDelinkTime);
            } else {
                this.user = this.defaultUser;
            }
        },
        loadingAnimation(button: "osu" | "discord"): void {
            let icon: HTMLElement;
            switch (button) {
                case "osu":
                    icon = document.getElementById("osu")
                    icon.classList.toggle("fa-circle");
                    icon.classList.toggle("fa-spinner");
                    icon.classList.toggle("fa-spin");
                    break;
                case "discord":
                    icon = document.getElementById("discord")
                    icon.classList.toggle("fab");
                    icon.classList.toggle("fa-discord");
                    icon.classList.toggle("fas");
                    icon.classList.toggle("fa-spinner");
                    icon.classList.toggle("fa-spin");
                    break;
            }
        },
        async osuAction(): Promise<void> {
            if(!this.user.osuLinked) {
                this.loadingAnimation("osu");
                window.location.href = "/api/auth/osu"
            } else {
                this.loadingAnimation("osu");
                await axios.get("/api/auth/logout");
                this.reloadData();
                this.loadingAnimation("osu");
            }
        },
        async discordAction(): Promise<void> {
            if(!this.user.discordLinked) {
                this.loadingAnimation("discord");
                window.location.href = "/api/auth/discord"
            } else {
                if(!this.user.availableDelinkDate) {
                    this.loadingAnimation("discord");
                    await axios.get("/api/auth/discord/delink");
                    this.reloadData();
                    this.loadingAnimation("discord");
                }
            }
        }
    },
    mounted(): void {
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

.actionBtn {
    display: inline-grid;
}

.alt {
    font-size: 8pt;
    font-weight: bold;
    color: #ccc;
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