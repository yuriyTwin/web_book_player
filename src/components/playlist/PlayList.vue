<template>
  <ul class="play-list">
    <li
      v-for="(track, index) in playlist"
      :key="track.id ?? track.title ?? index"
      class="track"
      :class="{ selected: index === currentTrack }"
      role="button"
      tabindex="0"
      :aria-selected="index === currentTrack"
      @click="selectTrack(index)"
      @keydown.enter.prevent="selectTrack(index)"
      @keydown.space.prevent="selectTrack(index)"
    >
      {{ track.title || 'Untitled' }}
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  playlist: {
    type: Array,
    default: () => []
  },
  currentTrack: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select'])

const START_TIME = 0 // явно: начать трек с начала

function selectTrack(index) {
  emit('select', index, START_TIME)
}
</script>

<style scoped>
@import '@/assets/css/play-list.css';
</style>
