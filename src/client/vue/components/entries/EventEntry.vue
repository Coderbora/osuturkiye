<template>
  <div class="event-entry row mb-2 text-center justify-content-center justify-content-lg-start text-lg-start align-items-center">
    <div class="icon"><img class="tournament-icon" :src="logoUrl" :alt="title"></div>
    <div class="description">
        <p class="title my-auto text-truncate">{{title}} <span class="stage"> | {{stage}} </span></p>
        <p class="hosts my-0 text-truncate">Hosted by {{host.join(", ")}}</p>
    </div>
    <div class="section-card deadline">{{deadline}}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        logoUrl: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        stage: {
            type: String,
            required: true
        },
        deadline: {
            type: String,
            required: true
        },
        host: {
            type: Array,
            required: true
        }
    }
})
</script>

<style scoped>
.event-entry {
    background: #111;
    border-radius: 2rem;
    padding: 0.5rem;
}

.icon {
    width: 3rem;
}

.description {
    width: calc(100% - 7.5rem);
}

.tournament-icon {
    width: 2.25rem;
}

.title {
    font-weight: 600;
}

.stage {
    font-size: 0.75rem;
    font-weight: 400;
    text-transform: uppercase;
}

.hosts {
    font-size: 0.7rem;
}

.deadline {
    padding: 0.5rem;
    width: 4.25rem;
    background: linear-gradient(45deg, #800000, #FF0000);
    text-align: center;
    font-weight: 600;
}

</style>