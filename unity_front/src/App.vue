<script setup lang="ts">
// No conditional logic needed - layouts handle the structure
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
/* Prevent flash of content */
#app {
  overflow-x: hidden;
}
</style>
