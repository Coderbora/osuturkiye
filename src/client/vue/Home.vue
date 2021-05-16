<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-8">
                <div class="section-card mb-3">
                    <div class="heading mb-4"><h4>News</h4></div>
                    <div class="content">
                        <news-entry authorName="Zeus-" authorColor="#6eac0a" authorAvatarUrl="https://a.ppy.sh/5464437?1231" title="asdadasdadasdadasdadasdadasdadasdadasdadasdadasdadasdadasdadasdadasdadasdad" content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sollicitudin vehicula vestibulum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent pulvinar felis eget accumsan lobortis. Nullam lobortis neque erat, vitae malesuada metus consectetur at. Aenean cursus finibus orci, vel bibendum sem luctus sed. Etiam fermentum lorem sed nisl cursus placerat. Ut eu molestie augue, non ultrices quam. Maecenas a velit nec tortor maximus maximus vel id velit. Vestibulum urna elit, vestibulum quis interdum sed, vehicula eget ipsum. " v-for="i in 10" :key="i"></news-entry>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="section-card mb-3">
                    <div class="heading"><h4>Events</h4></div>
                    <div class="content">
                        <event-entry v-for="i in 6" :key="'event'+i" :logoUrl="'./assets/favicon.png'" :deadline="'11/12'" :host="['Purpi', 'Coderbora', 'Zeus-']" :title="'vay turnuvası'"></event-entry>
                    </div>
                </div>
                <div class="section-card">
                    <div class="heading"><h4>Latest Plays</h4></div>
                    <div class="content">
                        <play-entry v-for="i in 5" :key="'play'+i" rank="X" mapSetId="1123907" userId="11873333" artist="Iwadare Noriyuki" mapTitle="Mikata 7 [Last Battle] [Finale]" pp="211" username="Coderbora"></play-entry>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import NewsEntry from "./components/entries/NewsEntry.vue";
import EventEntry from "./components/entries/EventEntry.vue";
import PlayEntry from "./components/entries/PlayEntry.vue";

export default {
    name: "Home",
    components: {
        NewsEntry,
        EventEntry,
        PlayEntry
    },
    data() { return {

    }},
    methods: {

    }
}
</script>

<style scoped>
h4 {
    text-transform: uppercase;
}

.section-card {
    padding: 2vw 2vw;
}
</style>