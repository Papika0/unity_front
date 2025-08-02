<script setup lang="ts">
import ToastContainer from '@/components/ui/ToastContainer.vue'
// No conditional logic needed - layouts handle the structure
</script>

<template>
  <div id="app">
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
