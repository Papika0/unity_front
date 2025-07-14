<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50">
    <div class="container mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <!-- Back button -->
        <button
          @click="router.push({ name: 'admin-projects' })"
          class="flex items-center text-amber-600 hover:text-amber-700 transition-colors font-medium"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
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
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
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
        <div class="relative h-80 overflow-hidden">
          <img
            v-if="project.main_image"
            :src="backendUrl + project.main_image"
            :alt="project.title"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center"
          >
            <svg
              class="h-24 w-24 text-amber-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <!-- Overlay gradient -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div class="p-8">
          <!-- Title & Badges -->
          <h1 class="text-4xl font-bold text-slate-900 mb-4 leading-tight">{{ project.title }}</h1>
          <div class="flex flex-wrap gap-3 mb-6">
            <span
              v-if="project.is_featured"
              class="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm border border-yellow-200"
            >
              <svg class="w-4 h-4 mr-1.5 inline" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                ></path>
              </svg>
              რჩეული
            </span>
            <span
              :class="
                project.status === 'completed'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : project.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
              "
              class="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border"
            >
              {{ project.status_name }}
            </span>
            <span
              v-if="!project.is_active"
              class="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm border border-red-200"
            >
              არააქტიური
            </span>
          </div>

          <!-- Description -->
          <p class="text-slate-700 text-lg leading-relaxed mb-8">{{ project.description }}</p>

          <!-- Key Details -->
          <div class="bg-slate-50 rounded-2xl p-6 mb-8">
            <h2 class="text-xl font-semibold text-slate-900 mb-4">პროექტის დეტალები</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-600">
              <div class="space-y-3">
                <div v-if="project.location">
                  <span class="text-sm font-medium text-slate-500 uppercase tracking-wide"
                    >მდებარეობა</span
                  >
                  <p class="text-slate-900 font-medium">{{ project.location }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-slate-500 uppercase tracking-wide"
                    >წელი</span
                  >
                  <p class="text-slate-900 font-medium">{{ project.year }}</p>
                </div>
              </div>
              <div class="space-y-3">
                <div>
                  <span class="text-sm font-medium text-slate-500 uppercase tracking-wide"
                    >დაწყების თარიღი</span
                  >
                  <p class="text-slate-900 font-medium">{{ formatDate(project.start_date) }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-slate-500 uppercase tracking-wide"
                    >დამთავრების თარიღი</span
                  >
                  <p class="text-slate-900 font-medium">
                    {{ formatDate(project.completion_date) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Render Image -->
          <div v-if="project.render_image" class="mb-8">
            <h2 class="text-2xl font-semibold text-slate-900 mb-4">რენდერი</h2>
            <div class="rounded-2xl overflow-hidden shadow-lg">
              <img
                :src="backendUrl + project.render_image"
                :alt="project.title + ' render'"
                class="w-full h-80 object-cover"
              />
            </div>
          </div>

          <!-- Gallery -->
          <div
            v-if="project.gallery_images && project.gallery_images.length > 0"
            class="border-t border-slate-200 pt-8"
          >
            <h2 class="text-2xl font-semibold text-slate-900 mb-6">გალერია</h2>

            <!-- Simple Grid Gallery (fallback for now) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="(img, idx) in project.gallery_images"
                :key="idx"
                class="relative overflow-hidden rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105"
              >
                <img
                  :src="backendUrl + img"
                  :alt="`${project.title} gallery ${idx + 1}`"
                  class="object-cover w-full h-64 hover:brightness-110 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <svg
          class="w-16 h-16 text-red-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
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
        <svg
          class="w-16 h-16 text-slate-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <h3 class="text-xl font-medium text-slate-800 mb-2">პროექტი ვერ მოიძებნა</h3>
        <p class="text-slate-600">მოცემული პროექტი არ არსებობს ან წაიშალა.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminProjectsStore } from '@/stores/adminProjects'
import type { Project } from '@/types'

const project = ref<Project | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const route = useRoute()
const router = useRouter()
const adminProjectsStore = useAdminProjectsStore()

const backendUrl = import.meta.env.VITE_BACKEND_URL

async function fetchProject() {
  try {
    loading.value = true
    error.value = null
    const projectId = Number(route.params.id)

    // Try to get from store first
    const storeProject = adminProjectsStore.projects.find((p) => p.id === projectId)
    if (storeProject) {
      project.value = storeProject
      loading.value = false
      return
    }

    // If not in store, fetch from API
    const result = await adminProjectsStore.fetchProject(projectId)
    if (result.success && result.data) {
      project.value = result.data
    } else {
      error.value = result.error || 'პროექტის ჩატვირთვა ვერ მოხერხდა'
    }
  } catch (e) {
    console.error('Failed to load project:', e)
    error.value = 'პროექტის ჩატვირთვა ვერ მოხერხდა'
  } finally {
    loading.value = false
  }
}

function editProject() {
  if (project.value) {
    router.push({
      name: 'admin-project-edit',
      params: { id: project.value.id.toString() },
    })
  }
}

function formatDate(dateStr: string) {
  const dt = new Date(dateStr)
  const months = [
    'იანვარი',
    'თებერვალი',
    'მარტი',
    'აპრილი',
    'მაისი',
    'ივნისი',
    'ივლისი',
    'აგვისტო',
    'სექტემბერი',
    'ოქტომბერი',
    'ნოემბერი',
    'დეკემბერი',
  ]
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

onMounted(fetchProject)
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>
