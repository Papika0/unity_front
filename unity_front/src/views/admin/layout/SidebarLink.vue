<template>
  <router-link
    :to="to"
    class="group flex items-center rounded-xl transition-all duration-200 relative"
    :class="[
      isActive
        ? `bg-gradient-to-r ${gradientColors} text-white shadow-lg ${shadowColor}`
        : `text-slate-600 ${hoverBgColor} ${hoverTextColor}`,
      sidebarOpen ? 'px-4 py-3' : 'px-2 py-3 justify-center'
    ]"
    :title="!sidebarOpen ? name : ''"
  >
    <svg class="h-5 w-5 flex-shrink-0" :class="sidebarOpen ? 'mr-3' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon"></path>
    </svg>
    <transition name="fade">
      <span v-if="sidebarOpen" class="text-sm font-medium">{{ name }}</span>
    </transition>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  to: string
  icon: string
  name: string
  color: string
  sidebarOpen: boolean
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

const shadowColor = computed(() => {
  switch (props.color) {
    case 'amber': return 'shadow-amber-500/25'
    case 'indigo': return 'shadow-indigo-500/25'
    case 'emerald': return 'shadow-emerald-500/25'
    case 'purple': return 'shadow-purple-500/25'
    case 'blue': return 'shadow-blue-500/25'
    case 'rose': return 'shadow-rose-500/25'
    case 'cyan': return 'shadow-cyan-500/25'
    default: return 'shadow-amber-500/25'
  }
})

const hoverBgColor = computed(() => `hover:bg-${props.color}-50`)
const hoverTextColor = computed(() => `hover:text-${props.color}-700`)
</script>
