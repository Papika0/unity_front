<template>
  <div>
    <h3
      class="text-2xl font-semibold text-slate-900 mb-8 pb-3 border-b-2 flex items-center"
      :class="borderColor"
    >
      <span class="w-1 h-6 rounded-full mr-3" :class="accentColor"></span>
      {{ title }}
    </h3>
    <slot />
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

const borderColor = computed(() => {
  const colors = {
    amber: 'border-amber-200',
    emerald: 'border-emerald-200',
    violet: 'border-violet-200',
  }
  return colors[props.variant]
})

const accentColor = computed(() => {
  const colors = {
    amber: 'bg-gradient-to-b from-amber-500 to-amber-400',
    emerald: 'bg-gradient-to-b from-emerald-500 to-emerald-400',
    violet: 'bg-gradient-to-b from-violet-500 to-purple-500',
  }
  return colors[props.variant]
})
</script>
