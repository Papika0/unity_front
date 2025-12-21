<template>
  <div class="w-64 lg:w-56 xl:w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <h3 class="text-sm font-semibold text-gray-700">{{ t('admin.polygon_editor.polygons') }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ t('admin.polygon_editor.items_count', { count: polygons.length }) }}</p>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <div
        v-if="polygons.length === 0"
        class="py-8 text-center text-gray-400 text-sm"
      >
        {{ t('admin.polygon_editor.no_polygons') }}
      </div>
      <div
        v-for="(polygon, index) in polygons"
        :key="polygon.id"
        class="p-2 rounded border cursor-pointer transition-colors"
        :class="{
          'bg-blue-50 border-blue-300': polygon.selected,
          'bg-white border-gray-200 hover:bg-gray-50': !polygon.selected,
        }"
        @click="emit('select', polygon.id)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 flex-1 min-w-0">
            <div
              class="w-4 h-4 rounded border-2 flex-shrink-0"
              :style="{ backgroundColor: polygon.fillColor, borderColor: polygon.strokeColor }"
            />
            <span class="text-sm font-medium text-gray-700 truncate">
              {{ polygon.label || `${t('admin.polygon_editor.polygons')} ${index + 1}` }}
            </span>
          </div>
          <div class="flex items-center space-x-1 flex-shrink-0">
            <button
              @click.stop="emit('toggle-visibility', polygon.id)"
              class="p-1 hover:bg-gray-200 rounded"
              :title="polygon.visible ? t('admin.polygon_editor.hide') : t('admin.polygon_editor.show')"
            >
              <svg
                v-if="polygon.visible"
                class="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </button>
            <button
              @click.stop="emit('delete', polygon.id)"
              class="p-1 hover:bg-red-100 rounded text-red-600"
              :title="t('admin.polygon_editor.delete')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="p-2 border-t border-gray-200 space-y-1">
      <button
        @click="emit('duplicate')"
        :disabled="!hasSelection"
        class="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('admin.polygon_editor.duplicate') }}
      </button>
      <button
        @click="emit('clear-all')"
        class="w-full px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50"
      >
        {{ t('admin.polygon_editor.clear_all') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Polygon } from '@/utils/polygon'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

defineProps<{
  polygons: Polygon[]
  hasSelection: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  'toggle-visibility': [id: string]
  delete: [id: string]
  duplicate: []
  'clear-all': []
}>()
</script>
