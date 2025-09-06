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
    <h3 class="text-lg font-normal font-roboto leading-normal mb-6">
      {{ title }}
    </h3>
    <ul class="space-y-4">
      <li v-for="(link, index) in links" :key="link.key || index">
        <BaseLink
          :variant="variant"
          :to="link.to || link.path"
          :href="link.href"
          :external="link.external"
        >
          {{ link.label }}
        </BaseLink>
      </li>
    </ul>
  </div>
</template>
