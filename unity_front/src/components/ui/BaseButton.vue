<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'outline' | 'link'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  to?: string
  external?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  external: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}

const baseClasses =
  'inline-flex items-center justify-center font-normal font-roboto uppercase tracking-widest transition-colors duration-200 text-center'

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const variantClasses = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
  outline: 'border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white',
  link: 'text-zinc-900 hover:text-zinc-600 underline',
}

const classes = [baseClasses, sizeClasses[props.size], variantClasses[props.variant]].join(' ')
</script>

<template>
  <router-link v-if="to" :to="to" :class="classes">
    <slot />
  </router-link>
  <a
    v-else-if="href"
    :href="href"
    :class="classes"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
  <button v-else :class="classes" @click="handleClick">
    <slot />
  </button>
</template>
