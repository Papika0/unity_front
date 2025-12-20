<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full divide-y divide-gray-200" style="min-width: 1000px">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 sm:w-48"
            >
              {{ t('admin.features.title') }}
            </th>
            <th
              class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 sm:w-48"
            >
              {{ t('admin.common.status') }}
            </th>
            <th
              class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Keywords
            </th>
            <th
              class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sm:w-32"
            >
              Sort Order
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80"
            >
              {{ t('admin.common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="feature in features" :key="feature.id" class="hover:bg-gray-50">
            <!-- Feature Name -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="text-sm font-medium text-gray-900">{{ feature.name }}</div>
                <div
                  class="w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-white text-sm"
                  :class="feature.color"
                >
                  {{ feature.icon }}
                </div>
              </div>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="feature.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ feature.is_active ? t('admin.common.active') : t('admin.common.inactive') }}
              </span>
            </td>

            <!-- Keywords -->
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="keyword in feature.keywords.slice(0, 3)"
                  :key="keyword"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ keyword }}
                </span>
                <span
                  v-if="feature.keywords.length > 3"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                >
                  +{{ feature.keywords.length - 3 }}
                </span>
              </div>
            </td>

            <!-- Sort Order -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ feature.sort_order }}
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 text-sm font-medium">
              <div class="flex flex-wrap items-center gap-3 w-80">
                <router-link
                  :to="`/admin/features/edit/${feature.id}`"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {{ t('admin.common.edit') }}
                </router-link>
                <button
                  @click="$emit('delete', feature.id)"
                  class="text-red-600 hover:text-red-800 transition-colors"
                >
                  {{ t('admin.common.delete') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Feature } from '@/services/featuresApi'
import { useTranslations } from '@/composables/useTranslations'

defineProps<{
  features: Feature[]
}>()

defineEmits<{
  (e: 'delete', id: number): void
}>()

const { t } = useTranslations()
</script>
