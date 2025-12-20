<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="container mx-auto px-6 py-12 max-w-5xl">
      <!-- Header -->
      <div class="mb-12">
        <button
          @click="goBack"
          class="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-all duration-300 mb-6 group font-medium text-sm bg-white/80 px-4 py-2 rounded-full border border-slate-300 hover:border-emerald-500/50 shadow-sm"
        >
          <svg class="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          {{ t('admin.projects.back_to_projects') }}
        </button>
        <h1 class="text-5xl font-light bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent mb-3 tracking-tight leading-tight py-1">
          {{ t('admin.projects.add_project') }}
        </h1>
        <p class="text-slate-600 text-xl font-light">{{ t('admin.projects.create_info') }}</p>
      </div>

      <!-- Upload Progress Indicator -->
      <div v-if="isUploading" class="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-700">{{ t('admin.projects.uploading') }}</h3>
          <span class="text-sm text-slate-500">{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-3">
          <div class="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-300 ease-out" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="text-sm text-slate-600 mt-2">{{ t('admin.projects.upload_info') }}</p>
      </div>

      <ProjectForm
        :form="form"
        :previews="previews"
        :submitting="submitting"
        :translating="translating"
        :is-edit="false"
        basic-info-variant="amber"
        details-variant="emerald"
        media-variant="violet"
        @submit="onSubmit"
        @translate="handleTranslate"
        @file-change="handleFileChange"
        @gallery-change="handleGalleryChange"
        @gallery-remove="removeGalleryImage"
        @update:form="updateForm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'
import { ProjectForm } from '@/components/admin'
import { useProjectAdd } from './composables'

const { t } = useTranslations()

const {
  form,
  previews,
  submitting,
  translating,
  uploadProgress,
  isUploading,
  goBack,
  updateForm,
  handleTranslate,
  handleFileChange,
  handleGalleryChange,
  removeGalleryImage,
  onSubmit,
} = useProjectAdd()
</script>

<style scoped>
.container {
  max-width: 1200px;
}

select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 3rem;
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.8);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.8);
}
</style>
