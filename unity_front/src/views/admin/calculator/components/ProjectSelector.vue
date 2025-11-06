<template>
  <div class="space-y-6">
    <!-- Project Dropdown -->
    <div>
      <label class="block text-sm font-semibold text-slate-800 mb-3">
        {{ t.selectProject }}
      </label>
      <select
        :value="selectedProject?.id"
        @change="handleProjectChange"
        class="w-full px-6 py-4 bg-white border-2 border-amber-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 font-medium shadow-sm"
      >
        <option value="">-- {{ t.selectProject }} --</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ getProjectTitle(project) }}
        </option>
      </select>
    </div>

    <!-- Base Price Selection -->
    <div v-if="selectedProject" class="space-y-4">
      <h4 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">
        {{ t.basePrice }}
      </h4>

      <!-- Use Project Price -->
      <label class="flex items-start p-4 border-2 border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all bg-amber-50">
        <input
          type="radio"
          :checked="!usesCustomPrice"
          @change="emit('update:usesCustomPrice', false)"
          class="mt-1 w-5 h-5 text-amber-600 border-slate-300 focus:ring-amber-500"
        />
        <div class="ml-3 flex-1">
          <span class="block font-semibold text-slate-900">
            {{ t.useProjectPrice }}
          </span>
          <span class="block text-2xl font-bold text-amber-600 mt-2">
            ${{ selectedProject.base_price_per_sqm || 0 }}/m²
          </span>
        </div>
      </label>

      <!-- Custom Price -->
      <label class="flex items-start p-4 border-2 border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all">
        <input
          type="radio"
          :checked="usesCustomPrice"
          @change="emit('update:usesCustomPrice', true)"
          class="mt-1 w-5 h-5 text-amber-600 border-slate-300 focus:ring-amber-500"
        />
        <div class="ml-3 flex-1">
          <span class="block font-semibold text-slate-900 mb-3">
            {{ t.customPrice }}
          </span>
          <input
            v-if="usesCustomPrice"
            :value="customPrice"
            @input="emit('update:customPrice', Number(($event.target as HTMLInputElement).value))"
            type="number"
            min="0"
            step="0.01"
            :placeholder="t.enterCustomPrice"
            class="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-black"
          />
        </div>
      </label>
    </div>

    <!-- Warning if no base price -->
    <div v-if="selectedProject && !selectedProject.base_price_per_sqm && !usesCustomPrice" class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
      <p class="text-yellow-800 text-sm">
        ⚠️ {{ t.noBasePriceWarning }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue'
import type { ActiveProject } from '@/types/admin/calculator'

interface Props {
  projects: ActiveProject[]
  selectedProject: ActiveProject | null
  usesCustomPrice: boolean
  customPrice: number
  currentLang: 'ka' | 'en' | 'ru'
}

const props = defineProps<Props>()

const translations = {
  ka: {
    selectProject: 'აირჩიეთ პროექტი',
    basePrice: 'საბაზო ფასი',
    useProjectPrice: 'გამოიყენეთ პროექტის საბაზო ფასი',
    customPrice: 'მითითებული საბაზო ფასი',
    noBasePriceWarning: 'ამ პროექტს არ აქვს საბაზო ფასი. გთხოვთ შეიყვანოთ მითითებული ფასი.',
    enterCustomPrice: 'შეიყვანეთ ფასი კვ.მ-ზე'
  },
  en: {
    selectProject: 'Select Project',
    basePrice: 'Base Price',
    useProjectPrice: 'Use Project Base Price',
    customPrice: 'Custom Base Price',
    noBasePriceWarning: 'This project has no base price set. Please enter a custom price.',
    enterCustomPrice: 'Enter price per m²'
  },
  ru: {
    selectProject: 'Выберите проект',
    basePrice: 'Базовая цена',
    useProjectPrice: 'Использовать базовую цену проекта',
    customPrice: 'Пользовательская базовая цена',
    noBasePriceWarning: 'У этого проекта нет установленной базовой цены. Пожалуйста, введите пользовательскую цену.',
    enterCustomPrice: 'Введите цену за м²'
  }
}

const t = computed(() => translations[props.currentLang])

const emit = defineEmits<{
  'update:selectedProject': [project: ActiveProject | null]
  'update:usesCustomPrice': [value: boolean]
  'update:customPrice': [value: number]
}>()

const getProjectTitle = (project: ActiveProject) => {
  const langKey = `title_${props.currentLang}` as keyof ActiveProject
  return project[langKey] || project.title || 'Untitled'
}

const handleProjectChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const projectId = Number(select.value)

  const project = props.projects.find(p => p.id === projectId) || null
  emit('update:selectedProject', project)
}
</script>
