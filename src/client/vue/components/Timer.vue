<template>
  <div>
    <div class="text-center" v-if="currentTime">
        <span v-if="days">{{ days }}:</span><span v-if="hours">{{ formatTime(hours) }}:</span><span>{{ formatTime(minutes) }}:{{ formatTime(seconds) }}</span>   
     </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  props: {
    deadline: {
      type: Number,
      required: true,
    },
    speed: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      currentTime: (this.deadline - Date.now()) as number
    };
  },
  mounted(): void {
    setTimeout(this.countdown, 1000);
  },
  computed: {
    seconds(): number {
      return Math.floor((this.currentTime / 1000) % 60);
    },
    minutes(): number {
      return Math.floor((this.currentTime / 1000 / 60) % 60);
    },
    hours(): number {
      return Math.floor((this.currentTime / (1000 * 60 * 60)) % 24);
    },
    days(): number {
      return Math.floor(this.currentTime / (1000 * 60 * 60 * 24));
    }
  },
  methods: {
    countdown(): void {
      this.currentTime = this.deadline - Date.now();
      if (this.currentTime > 0) {
        setTimeout(this.countdown, this.speed);
      } else {
        this.currentTime = 0;
      }
    },
    formatTime(value: number): string {
      if (value < 10) {
        return "0" + value;
      }
      return value.toString();
    }
  }
})
</script>