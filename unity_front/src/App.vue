<script setup lang="ts">
import ToastContainer from '@/components/ui/ToastContainer.vue'
import GlobalLoadingOverlay from '@/components/ui/GlobalLoadingOverlay.vue'
// No conditional logic needed - layouts handle the structure
</script>

<template>
  <div id="app">
    <GlobalLoadingOverlay />
    <RouterView />
    <ToastContainer />
  </div>
</template>

<style>
/* Prevent flash of content */
#app {
  overflow-x: hidden;
}
</style>
