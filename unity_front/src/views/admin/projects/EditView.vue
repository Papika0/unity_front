<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="container mx-auto px-6 py-12 max-w-5xl">
      <!-- Header -->
      <div class="mb-12">
        <button
          @click="goBack"
          class="inline-flex items-center text-amber-600 hover:text-amber-700 transition-all duration-300 mb-6 group font-medium text-sm bg-white/80 px-4 py-2 rounded-full border border-slate-300 hover:border-amber-500/50 shadow-sm"
        >
          <svg class="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          უკან დეტალებზე
        </button>
        <h1 class="text-5xl font-light bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent mb-3 tracking-tight leading-tight py-1">
          პროექტის რედაქტირება
        </h1>
        <p class="text-slate-600 text-xl font-light">განაახლეთ პროექტის ინფორმაცია და მედია ფაილები</p>
      </div>

      <ProjectForm
        :form="form"
        :previews="previews"
        :submitting="submitting"
        :translating="translating"
        :is-edit="true"
        :backend-url="backendUrl"
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
import { ProjectForm } from '@/components/admin'
import { useProjectEdit } from './composables'

const {
  form,
  previews,
  submitting,
  translating,
  backendUrl,
  goBack,
  updateForm,
  handleTranslate,
  handleFileChange,
  handleGalleryChange,
  removeGalleryImage,
  onSubmit,
} = useProjectEdit()
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
  outline: 2px solid #f59e0b;
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
