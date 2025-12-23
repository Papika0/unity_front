<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <router-link to="/admin/features" class="text-gray-500 hover:text-gray-700 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <h1 class="text-3xl font-bold text-gray-900">{{ t('admin.features.assign_to_project') }}</h1>
      </div>
      <p class="text-gray-600">{{ t('admin.features.select_features') }}</p>
    </div>

    <!-- Project Selection -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('admin.features.select_project') }}</h2>
      <select
        v-model="selectedProjectId"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      >
        <option value="">{{ t('admin.features.select_project') }}</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.title }}
        </option>
      </select>
    </div>

    <!-- Features Selection -->
    <div v-if="selectedProjectId" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ t('admin.features.select_features') }}</h2>

      <!-- Auto-detect option -->
      <div class="mb-6 p-4 bg-blue-50 rounded-lg">
        <label class="inline-flex items-center">
          <input v-model="autoDetect" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <span class="ml-2 text-sm text-gray-700">{{ t('admin.features.auto_detect_desc') }}</span>
        </label>
      </div>

      <!-- Manual selection -->
      <div v-if="!autoDetect" class="space-y-4">
        <!-- Loading state -->
        <div v-if="isLoadingProjectFeatures" class="flex items-center justify-center py-8">
          <div class="flex items-center gap-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span class="text-gray-600">{{ t('admin.features.loading_features') }}</span>
          </div>
        </div>

        <!-- Currently assigned features count -->
        <div v-else-if="selectedFeatures.length > 0" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm font-medium text-green-800">{{ selectedFeatures.length }} {{ t('admin.features.features_assigned') }}</span>
          </div>
        </div>

        <FeatureCheckboxItem
          v-for="feature in features"
          :key="feature.id"
          v-show="!isLoadingProjectFeatures"
          :feature="feature"
          :is-selected="selectedFeatures.includes(feature.id)"
          v-model="selectedFeatures"
        />
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end gap-4">
        <router-link to="/admin/features" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          {{ t('admin.common.cancel') }}
        </router-link>
        <button
          @click="assignFeatures"
          :disabled="isSubmitting || (!autoDetect && selectedFeatures.length === 0)"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <div v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {{ isSubmitting ? t('admin.features.assigning') : t('admin.features.assign') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useFeatureAssignment } from './composables'
import FeatureCheckboxItem from './components/FeatureCheckboxItem.vue'

const { t } = useTranslations()

const {
  features,
  projects,
  selectedProjectId,
  selectedFeatures,
  autoDetect,
  isSubmitting,
  isLoadingProjectFeatures,
  assignFeatures,
} = useFeatureAssignment()
</script>
