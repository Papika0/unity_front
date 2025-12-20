<template>
  <div class="w-80 lg:w-72 xl:w-80 bg-gray-50 border-l border-gray-200 flex flex-col overflow-y-auto">
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700">თვისებები</h3>
      <button
        @click="emit('close')"
        class="p-1 hover:bg-gray-200 rounded transition-colors"
        title="დახურვა"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <div class="p-4 space-y-4">
      <!-- Entity Selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ entityLabel || 'დაკავშირებული ელემენტი' }}
        </label>
        <select
          :value="polygon.entityId"
          @change="emit('update:entityId', Number(($event.target as HTMLSelectElement).value) || null)"
          class="w-full border-gray-300 rounded text-gray-900"
        >
          <option :value="null">არ არის არჩეული</option>
          <option v-for="entity in entities" :key="entity.id" :value="entity.id">
            {{ getEntityDisplayName(entity) }}
          </option>
        </select>
      </div>

      <!-- Label -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ლეიბლი</label>
        <input
          :value="polygon.label"
          @input="emit('update:label', ($event.target as HTMLInputElement).value)"
          type="text"
          class="w-full border-gray-300 rounded text-gray-900"
        />
      </div>

      <!-- Coordinates -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">კოორდინატები</label>
        <textarea
          :value="JSON.stringify(polygon.points, null, 2)"
          @input="emit('update:points-json', ($event.target as HTMLTextAreaElement).value)"
          class="w-full h-32 text-xs font-mono border-gray-300 rounded text-gray-900"
        />
      </div>

      <!-- Bounding Box Info -->
      <div v-if="boundingBox" class="text-xs text-gray-600 space-y-1">
        <div class="font-medium mb-2">შემომსაზღვრელი ყუთი:</div>
        <div>X: {{ boundingBox.min_x }} - {{ boundingBox.max_x }}</div>
        <div>Y: {{ boundingBox.min_y }} - {{ boundingBox.max_y }}</div>
        <div>სიგანე: {{ boundingBox.width }}</div>
        <div>სიმაღლე: {{ boundingBox.height }}</div>
        <div>ფართობი: {{ Math.round(area) }} px²</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Polygon } from '@/utils/polygon'

defineProps<{
  polygon: Polygon
  entities: Array<{ id: number; apartment_number?: string; name?: string | Record<string, string>; label?: string }>
  entityLabel?: string
  boundingBox: { min_x: number; min_y: number; max_x: number; max_y: number; width: number; height: number } | null
  area: number
}>()

const emit = defineEmits<{
  close: []
  'update:entityId': [value: number | null]
  'update:label': [value: string]
  'update:points-json': [value: string]
}>()

function getEntityDisplayName(entity: { id: number; apartment_number?: string; name?: string | Record<string, string>; label?: string }): string {
  if (entity.apartment_number) {
    return `ბინა ${entity.apartment_number}`
  }
  if (entity.name) {
    if (typeof entity.name === 'object') {
      return entity.name.ka || entity.name.en || Object.values(entity.name)[0] || `#${entity.id}`
    }
    return entity.name
  }
  if (entity.label) {
    return entity.label
  }
  return `#${entity.id}`
}
</script>
