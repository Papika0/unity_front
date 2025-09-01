<template>
  <!-- Language switcher will now use global overlay instead of its own overlay -->
</template>

<script setup lang="ts">
// Language switcher logic is now handled through the global overlay
// The switching state and overlay are managed by GlobalLoadingOverlay.vue
</script>
</script>

<style scoped>
/* Smooth backdrop blur */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Custom animation for progress bar */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
