<template>
  <div class="w-80 lg:w-72 xl:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
    <!-- Project Selector -->
    <div class="p-6 border-b border-gray-200 bg-gradient-to-br from-indigo-50 to-white">
      <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        პროექტი
      </h3>
      <select
        :value="selectedProjectId"
        @change="$emit('update:selectedProjectId', ($event.target as HTMLSelectElement).value); $emit('projectChange')"
        class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
      >
        <option value="">აირჩიეთ პროექტი</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.title }}
        </option>
      </select>
    </div>

    <!-- Buildings List -->
    <div v-if="selectedProjectId" class="flex-1 overflow-y-auto p-4">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center">
          <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          შენობები
        </h3>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {{ buildings.length }}
        </span>
      </div>
      
      <div v-if="isLoadingBuildings" class="text-center py-8">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-gray-500 mt-2">იტვირთება...</p>
      </div>
      
      <div v-else-if="buildings.length === 0" class="text-center py-8">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p class="text-sm text-gray-500">არ არის შენობები</p>
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="building in buildings"
          :key="building.id"
          @click="$emit('selectBuilding', building.id)"
          class="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-indigo-100 border border-gray-200 hover:border-indigo-300 transition-all duration-200 cursor-pointer group"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {{ (building.name as any)?.ka || building.name }}
              </div>
              <div class="text-xs text-gray-500 mt-1 flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                {{ building.identifier }}
              </div>
            </div>
            <div class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        ინსტრუქციები
      </h4>
      <ol class="text-xs text-gray-700 space-y-2">
        <li class="flex items-start">
          <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
          <span>აირჩიეთ პროექტი</span>
        </li>
        <li class="flex items-start">
          <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
          <span>ატვირთეთ ზონის სურათი</span>
        </li>
        <li class="flex items-start">
          <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
          <span>დახატეთ შენობის ბლოკები</span>
        </li>
        <li class="flex items-start">
          <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">4</span>
          <span>დააკავშირეთ ისინი შენობებთან</span>
        </li>
        <li class="flex items-start">
          <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">5</span>
          <span>შეინახეთ ცვლილებები</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types'
import type { Building } from '@/types/apartments'

defineProps<{
  selectedProjectId: string | number
  projects: Project[]
  buildings: Building[]
  isLoadingBuildings: boolean
}>()

defineEmits<{
  (e: 'update:selectedProjectId', value: string): void
  (e: 'projectChange'): void
  (e: 'selectBuilding', buildingId: number): void
}>()
</script>
