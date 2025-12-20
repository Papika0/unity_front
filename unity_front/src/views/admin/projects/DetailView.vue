<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50">
    <div class="container mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <!-- Back button -->
        <button
          @click="goBack"
          class="flex items-center text-amber-600 hover:text-amber-700 transition-colors font-medium"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          უკან პროექტებზე
        </button>

        <!-- Edit button -->
        <button
          v-if="project"
          @click="editProject"
          class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
        >
          <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          რედაქტირება
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow-lg rounded-2xl overflow-hidden animate-pulse">
        <div class="w-full h-80 bg-slate-200"></div>
        <div class="p-8">
          <div class="h-8 bg-slate-200 rounded mb-4"></div>
          <div class="h-4 bg-slate-200 rounded mb-2"></div>
          <div class="h-4 bg-slate-200 rounded w-3/4 mb-6"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-4 bg-slate-200 rounded"></div>
            <div class="h-4 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Project Content -->
      <div v-else-if="project" class="bg-white shadow-lg rounded-2xl overflow-hidden">
        <!-- Main Hero Image -->
        <ProjectHeroImage :project="project" />

        <div class="p-8">
          <!-- Title & Badges -->
          <ProjectHeader :project="project" />

          <!-- Description -->
          <p class="text-slate-700 text-lg leading-relaxed mb-8">{{ project.description }}</p>

          <!-- Key Details -->
          <ProjectDetails :project="project" :format-date="formatDate" />

          <!-- Render Image -->
          <ProjectRenderImage v-if="project.render_image" :project="project" />

          <!-- Gallery -->
          <ProjectGallery v-if="project.gallery_images && project.gallery_images.length > 0" :project="project" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-xl font-medium text-red-800 mb-2">პროექტის ჩატვირთვის შეცდომა</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
          @click="fetchProject"
          class="bg-red-100 text-red-800 px-6 py-3 rounded-lg hover:bg-red-200 transition-colors font-medium"
        >
          ხელახლა ცდა
        </button>
      </div>

      <!-- Not Found State -->
      <div v-else class="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
        <svg class="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 class="text-xl font-medium text-slate-800 mb-2">პროექტი ვერ მოიძებნა</h3>
        <p class="text-slate-600">მოცემული პროექტი არ არსებობს ან წაიშალა.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectDetail } from './composables'
import {
  ProjectHeroImage,
  ProjectHeader,
  ProjectDetails,
  ProjectRenderImage,
  ProjectGallery,
} from './components'

const {
  project,
  loading,
  error,
  fetchProject,
  editProject,
  goBack,
  formatDate,
} = useProjectDetail()
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>
