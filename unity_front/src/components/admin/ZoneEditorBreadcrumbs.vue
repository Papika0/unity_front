<template>
  <nav class="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
    <router-link
      to="/admin/projects"
      class="text-gray-500 hover:text-purple-600 transition-colors flex items-center"
    >
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      {{ t('admin.sidebar.projects') }}
    </router-link>

    <template v-for="(item, index) in breadcrumbs" :key="index">
      <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd" />
      </svg>

      <router-link
        v-if="item.route"
        :to="item.route"
        class="text-gray-500 hover:text-purple-600 transition-colors"
      >
        {{ formatLabel(item.label) }}
      </router-link>
      <span v-else class="text-gray-900 font-medium">
        {{ formatLabel(item.label) }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useZoneEditorStore } from '@/stores/admin/zoneEditor'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()
const store = useZoneEditorStore()
const breadcrumbs = computed(() => store.breadcrumbs)

function formatLabel(label: string) {
  if (label.startsWith('floor_key:')) {
    const floor = label.split(':')[1]
    return `${t('admin.zones.floor_strip_editor.floor')} ${floor}`
  }
  return label
}
</script>
