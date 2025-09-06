<script setup lang="ts">
interface Props {
  variant?: 'footer' | 'header' | 'social'
  href?: string
  to?: string
  external?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'footer',
  external: false,
})

const baseClasses = 'font-normal font-roboto leading-relaxed transition-colors duration-200'

const variantClasses = {
  footer: 'text-xl text-zinc-900 hover:text-zinc-600',
  header: 'text-base xl:text-lg font-medium text-zinc-900 hover:text-zinc-600',
  social: 'text-xl text-zinc-900 hover:text-zinc-600',
}

const classes = [baseClasses, variantClasses[props.variant]].join(' ')
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
</template>
