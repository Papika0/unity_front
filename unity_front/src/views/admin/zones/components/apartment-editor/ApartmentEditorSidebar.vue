<template>
  <div class="w-80 lg:w-72 xl:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
    <!-- Building & Floor Info -->
    <div class="p-6 border-b border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
      <div class="space-y-3">
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase mb-1">{{ t('admin.zones.building_block_editor.building') }}</h3>
          <div class="text-sm font-semibold text-gray-900 flex items-center">
            <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {{ buildingName }}
          </div>
        </div>
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase mb-1">{{ t('common.floor') }}</h3>
          <div class="text-sm font-semibold text-gray-900 flex items-center">
            <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            {{ floorNumber }}
          </div>
        </div>
      </div>
    </div>

    <!-- Apartments List -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center">
          <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {{ t('admin.apartments.title') }}
        </h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {{ apartments.length }}
        </span>
      </div>
      
      <div v-if="isLoadingApartments" class="text-center py-8">
        <svg class="animate-spin h-8 w-8 text-emerald-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-gray-500 mt-2">{{ t('admin.common.loading') }}</p>
      </div>
      
      <div v-else-if="apartments.length === 0" class="text-center py-8">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <p class="text-sm text-gray-500">{{ t('admin.apartments.no_apartments_found') }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ t('admin.apartments.create_apartments_instruction') }}</p>
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="apartment in apartments"
          :key="apartment.id"
          class="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-emerald-100 border border-gray-200 hover:border-emerald-300 transition-all duration-200 cursor-pointer group"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                {{ t('admin.zones.apartment') }} {{ apartment.apartment_number }}
              </div>
              <div class="text-xs text-gray-500 mt-1 space-y-0.5">
                <div v-if="apartment.area_total" class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  {{ apartment.area_total }} {{ t('common.sqm') }}
                </div>
                <div v-if="apartment.bedrooms" class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {{ apartment.bedrooms }} {{ t('admin.apartments.form.rooms') }}
                </div>
                <div v-if="apartment.status" class="flex items-center">
                  <span class="inline-block w-2 h-2 rounded-full mr-1.5" 
                    :class="{
                      'bg-green-500': apartment.status === 'available',
                      'bg-yellow-500': apartment.status === 'reserved',
                      'bg-red-500': apartment.status === 'sold'
                    }">
                  </span>
                  <span class="text-xs">
                    {{ t(`admin.apartments.status.${apartment.status}`) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="p-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
      <h4 class="text-xs font-semibold text-gray-900 uppercase mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ t('admin.zones.instructions') }}
      </h4>
      <ol class="text-xs text-gray-700 space-y-2">
        <li class="flex items-start">
          <span class="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
          <span>{{ t('admin.zones.step1') }}</span>
        </li>
        <li class="flex items-start">
          <span class="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
          <span>{{ t('admin.zones.step2') }}</span>
        </li>
        <li class="flex items-start">
          <span class="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
          <span>{{ t('admin.zones.step3') }}</span>
        </li>
        <li class="flex items-start">
          <span class="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">4</span>
          <span>{{ t('admin.zones.step4') }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Building, Apartment } from '@/types/apartments'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t, currentLocale } = useTranslations()

const props = defineProps<{
  selectedBuilding: Building | null
  floorNumber: number
  apartments: Apartment[]
  isLoadingApartments: boolean
}>()

const buildingName = computed(() => {
  const name = props.selectedBuilding?.name
  if (typeof name === 'object' && name !== null) {
    return (name as Record<string, string>)[currentLocale] || (name as Record<string, string>).ka || 'N/A'
  }
  return name || 'N/A'
})
</script>
