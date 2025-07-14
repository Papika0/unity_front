<template>
  <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
    <div class="border-b border-slate-200 p-8" :class="headerGradient">
      <h2 class="text-2xl font-light text-white">{{ title }}</h2>
    </div>
    <div class="p-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  variant?: 'amber' | 'emerald' | 'violet'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'amber',
})

const headerGradient = computed(() => {
  const gradients = {
    amber: 'bg-gradient-to-r from-amber-500/90 to-yellow-500/90',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    violet: 'bg-gradient-to-r from-violet-500 to-purple-600',
  }
  return gradients[props.variant]
})
</script>
