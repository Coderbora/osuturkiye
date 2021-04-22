<template>
  <div>
    <div class="text-center" v-if="currentTime">
        <span v-if="days">{{ days }}:</span><span v-if="hours">{{ formatTime(hours) }}:</span><span>{{ formatTime(minutes) }}:{{ formatTime(seconds) }}</span>   
     </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    deadline: {
      type: String,
      required: true,
    },
    speed: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      currentTime: Date.parse(this.deadline) - Date.parse(new Date().toString())
    };
  },
  mounted() {
    setTimeout(this.countdown, 1000);
  },
  computed: {
    seconds() {
      return Math.floor((this.currentTime / 1000) % 60);
    },
    minutes() {
      return Math.floor((this.currentTime / 1000 / 60) % 60);
    },
    hours() {
      return Math.floor((this.currentTime / (1000 * 60 * 60)) % 24);
    },
    days() {
      return Math.floor(this.currentTime / (1000 * 60 * 60 * 24));
    }
  },
  methods: {
    countdown() {
      this.currentTime = Date.parse(this.deadline) - Date.parse(new Date().toString());
      if (this.currentTime > 0) {
        setTimeout(this.countdown, this.speed);
      } else {
        this.currentTime = null;
      }
    },
    formatTime(value: Number) {
      if (value < 10) {
        return "0" + value;
      }
      return value;
    }
  }
}
</script>