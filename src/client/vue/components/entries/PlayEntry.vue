<template>
  <div v-if="mapSetId" :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://assets.ppy.sh/beatmaps/${mapSetId}/covers/cover.jpg?${Date.now()})` }"
   class="section-card p-2 row mb-2 text-center justify-content-center
   justify-content-lg-start text-lg-start align-items-center">
    <div class="player" @click="openUser">
        <img v-if="userId" class="player-avatar" :src="`https://a.ppy.sh/${userId}?${Date.now()}`" :alt="username">
        <p class="mb-0">{{username}}</p>
    </div>
    <div class="details" @click="openMap">
        <p class="title text-truncate mb-0">{{mapTitle}}</p>
        <p class="artist mb-0">{{artist}}</p>
    </div>
    <div class="section-card pp" :style="{ background: `linear-gradient(${rankColors[rank].join(',')})`}">{{pp}}pp</div>
  </div>
</template>

<script lang="ts">
export default {
    props: {
        username: {
            type: String,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        mapTitle: {
            type: String,
            required: true
        },
        artist: {
            type: String,
            required: true
        },
        mapSetId: {
            type: String,
            required: true
        },
        rank: {
            type: String,
            required: true
        },
        pp: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            rankColors: {
                XH: ["#DE31AE", "#EAF5FA"],
                X: ["#DE31AE", "#FFD977"],
                SH: ["#02B5C3", "#EAF5FA"],
                S: ["#02B5C3", "#FFD977"],
                A: ["#88DA20", "#275227"],
                B: ["#EBBD48", "#553A2B"],
                C: ["#FF855D", "#473625"],
                D: ["#F45555", "#502020"],
            }
        }
    },
    methods: {
        openUser(): void {
            window.open(`https://osu.ppy.sh/users/${this.userId}`)
        },
        openMap(): void {
            window.open(`https://osu.ppy.sh/beatmapsets/${this.mapSetId}`)
        }
    }   
}
</script>

<style scoped>
.section-card {
    background-size: cover;
}

.player {
    width: 6.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    align-items: center;
    text-align: center;
    cursor: pointer;
}

.details {
    width: calc(100% - 11.5rem);
    cursor: pointer;
}

.title {
    font-weight: 600;
}

.player-avatar {
    width: 3rem;
    border-radius: 1.5rem;
}

.pp {
    padding: 0.5rem;
    width: 4.25rem;
    background: linear-gradient(#800000, #FF0000);
    text-align: center;
    font-weight: 600;
}
</style>