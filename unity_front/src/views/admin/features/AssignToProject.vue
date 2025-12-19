<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <router-link
          to="/admin/features"
          class="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </router-link>
        <h1 class="text-3xl font-bold text-gray-900">ფუნქციების მინიჭება პროექტს</h1>
      </div>
      <p class="text-gray-600">აირჩიეთ ფუნქციები, რომლებიც უნდა მიენიჭოს პროექტს</p>
    </div>

    <!-- Project Selection -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">პროექტის არჩევა</h2>
      <select
        v-model="selectedProjectId"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      >
        <option value="">აირჩიეთ პროექტი</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.title }}
        </option>
      </select>
    </div>

    <!-- Features Selection -->
    <div v-if="selectedProjectId" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">ფუნქციების არჩევა</h2>

      <!-- Auto-detect option -->
      <div class="mb-6 p-4 bg-blue-50 rounded-lg">
        <label class="inline-flex items-center">
          <input
            v-model="autoDetect"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span class="ml-2 text-sm text-gray-700"
            >ავტომატური გამოვლენა (პროექტის აღწერის მიხედვით)</span
          >
        </label>
      </div>

      <!-- Manual selection -->
      <div v-if="!autoDetect" class="space-y-4">
        <!-- Loading state -->
        <div v-if="isLoadingProjectFeatures" class="flex items-center justify-center py-8">
          <div class="flex items-center gap-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span class="text-gray-600">ფუნქციების ჩატვირთვა...</span>
          </div>
        </div>

        <!-- Currently assigned features count -->
        <div
          v-else-if="selectedFeatures.length > 0"
          class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span class="text-sm font-medium text-green-800">
              {{ selectedFeatures.length }} ფუნქცია მინიჭებულია ამ პროექტს
            </span>
          </div>
        </div>

        <div
          v-for="feature in features"
          :key="feature.id"
          v-show="!isLoadingProjectFeatures"
          class="flex items-center p-4 border rounded-lg transition-all"
          :class="[
            selectedFeatures.includes(feature.id)
              ? 'border-green-300 bg-green-50'
              : 'border-gray-200 hover:bg-gray-50',
          ]"
        >
          <input
            :id="`feature-${feature.id}`"
            v-model="selectedFeatures"
            :value="feature.id"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label :for="`feature-${feature.id}`" class="ml-3 flex-1 cursor-pointer">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-md bg-gradient-to-r flex items-center justify-center text-white text-sm"
                :class="feature.color"
              >
                {{ feature.icon }}
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 flex items-center gap-2">
                  {{ feature.title.ka || feature.title.en || feature.name }}
                  <span
                    v-if="selectedFeatures.includes(feature.id)"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    მინიჭებული
                  </span>
                </div>
                <div class="text-sm text-gray-600">
                  {{ feature.description.ka || feature.description.en || '' }}
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end gap-4">
        <router-link
          to="/admin/features"
          class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          გაუქმება
        </router-link>
        <button
          @click="assignFeatures"
          :disabled="isSubmitting || (!autoDetect && selectedFeatures.length === 0)"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <div
            v-if="isSubmitting"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          {{ isSubmitting ? 'მინიჭება...' : 'ფუნქციების მინიჭება' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { featuresApi, type Feature, type ProjectFeature } from '@/services/featuresApi'
import { projectsApi, type ProjectApiResponse } from '@/services/projectsApi'

const router = useRouter()
const features = ref<Feature[]>([])
const projects = ref<ProjectApiResponse[]>([])
const selectedProjectId = ref('')
const selectedFeatures = ref<number[]>([])
const autoDetect = ref(false)
const isSubmitting = ref(false)
const isLoadingProjectFeatures = ref(false)

const loadFeatures = async () => {
  try {
    features.value = await featuresApi.adminGetAll()
  } catch (error) {
    console.error('Failed to load features:', error)
  }
}

const loadProjects = async () => {
  try {
    // For admin, we can use default locale since it's just for selection
    projects.value = await projectsApi.getAll('ka')
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}

const loadProjectFeatures = async (projectId: string) => {
  if (!projectId) {
    selectedFeatures.value = []
    return
  }

  isLoadingProjectFeatures.value = true
  try {
    const projectFeatures = await featuresApi.getProjectFeatures(parseInt(projectId))
    selectedFeatures.value = projectFeatures.map((feature: ProjectFeature) => feature.id)
    console.log('Loaded project features:', projectFeatures)
  } catch (err: unknown) {
    console.error('Failed to load project features:', err)
    selectedFeatures.value = []
  } finally {
    isLoadingProjectFeatures.value = false
  }
}

const assignFeatures = async () => {
  if (!selectedProjectId.value) return

  isSubmitting.value = true
  try {
    console.log('Assigning features:', {
      projectId: selectedProjectId.value,
      autoDetect: autoDetect.value,
      selectedFeatures: selectedFeatures.value,
    })

    if (autoDetect.value) {
      // Auto-detect features
      console.log('Using auto-detect mode')
      await featuresApi.assignToProject(parseInt(selectedProjectId.value), [], true)
    } else {
      // Manual selection
      console.log('Using manual selection mode')
      await featuresApi.assignToProject(
        parseInt(selectedProjectId.value),
        selectedFeatures.value,
        false,
      )
    }

    console.log('Features assigned successfully')
    router.push('/admin/features')
  } catch (err: unknown) {
    console.error('Failed to assign features:', err)
    const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    const errorMessage =
      error.response?.data?.message || error.message || 'ფუნქციების მინიჭება ვერ მოხერხდა'
    alert(`შეცდომა: ${errorMessage}`)
  } finally {
    isSubmitting.value = false
  }
}

// Watch for project selection changes
watch(selectedProjectId, (newProjectId) => {
  if (newProjectId) {
    loadProjectFeatures(newProjectId)
  } else {
    selectedFeatures.value = []
  }
})

onMounted(() => {
  loadFeatures()
  loadProjects()
})
</script>
