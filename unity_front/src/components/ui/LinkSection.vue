<script setup lang="ts">
import BaseLink from './BaseLink.vue'

interface Props {
  title: string
  links: Array<{
    key?: string
    label?: string
    to?: string
    href?: string
    path?: string
    external?: boolean
  }>
  variant?: 'footer' | 'social'
}

withDefaults(defineProps<Props>(), {
  variant: 'footer',
})
</script>

<template>
  <div>
    <h3
      class="text-lg font-semibold font-roboto leading-normal mb-6 text-zinc-900 uppercase tracking-wide"
    >
      {{ title }}
    </h3>
    <ul class="space-y-3">
      <li v-for="(link, index) in links" :key="link.key || index">
        <BaseLink
          :variant="variant"
          :to="link.to || link.path"
          :href="link.href"
          :external="link.external"
          class="text-base font-normal font-roboto leading-relaxed text-zinc-900 hover:text-red-600 transition-colors duration-200"
        >
          {{ link.label }}
        </BaseLink>
      </li>
    </ul>
  </div>
</template>
