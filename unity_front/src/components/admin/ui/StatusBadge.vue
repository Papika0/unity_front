<template>
  <span :class="badgeClasses">
    {{ active ? '✅ აქტიური' : '❌ არააქტიური' }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  active: number
}

const props = defineProps<Props>()

const badgeClasses = computed(() => {
  const isActive = props.active === 1
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`
})
</script>
