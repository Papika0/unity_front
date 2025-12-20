<template>
  <router-link
    :to="to"
    @click="emit('click')"
    class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
    :class="[
      isActive
        ? `bg-gradient-to-r ${gradientColors} text-white`
        : `text-slate-600 hover:bg-${color}-50 hover:text-${color}-700`
    ]"
  >
    {{ name }}
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  to: string
  name: string
  color: string
}>()

const emit = defineEmits<{
  click: []
}>()

const route = useRoute()

const isActive = computed(() => {
  if (props.to === '/admin/dashboard') return route.path === props.to
  return route.path.startsWith(props.to)
})

const gradientColors = computed(() => {
  switch (props.color) {
    case 'amber': return 'from-amber-500 to-amber-600'
    case 'indigo': return 'from-indigo-500 to-indigo-600'
    case 'emerald': return 'from-emerald-500 to-emerald-600'
    case 'purple': return 'from-purple-500 to-purple-600'
    case 'blue': return 'from-blue-500 to-blue-600'
    case 'rose': return 'from-rose-500 to-rose-600'
    case 'cyan': return 'from-cyan-500 to-cyan-600'
    default: return 'from-amber-500 to-amber-600'
  }
})
</script>
