<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useProjectsPage } from '../composables/useProjectsPage'
import { useProjectsStore } from '@/stores/public/projects'

const { t } = useTranslations()
const {
  allProjects,
  totalProjects,
  hasMorePages,
  currentPage,
  isLoading,
  error,
  loadProjectsPage,
} = useProjectsPage()

// Initialize projects store
const projectsStore = useProjectsStore()

const selectedCategory = ref('all')

const categories = ref([
  { value: 'all', label: 'ყველა' },
  { value: 'ongoing', label: 'მშენებარე' },
  { value: 'completed', label: 'დასრულებული' },
  { value: 'planning', label: 'დაგეგმილი' },
])

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'all') {
    return allProjects.value
  }
  return allProjects.value.filter((project) => project.status === selectedCategory.value)
})

// Function to load projects and update store
const loadProjectsAndUpdateStore = async (page: number = 1, loadMore: boolean = false) => {
  await loadProjectsPage(page, loadMore)

  // Update the projects store with the loaded projects
  if (allProjects.value.length > 0) {
    projectsStore.$patch({
      projects: allProjects.value,
    })
  }
}

// Reset and reload projects when category changes
watch(selectedCategory, async () => {
  await loadProjectsAndUpdateStore(1, false)
})

// Load projects page data on component mount
onMounted(async () => {
  await loadProjectsAndUpdateStore()
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-600 text-white border border-green-300 shadow-lg'
    case 'ongoing':
      return 'bg-amber-600 text-white border border-amber-300 shadow-lg'
    case 'planning':
      return 'bg-gray-600 text-white border border-gray-300 shadow-lg'
    default:
      return 'bg-zinc-600 text-white border border-zinc-300 shadow-lg'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'დასრულებული'
    case 'ongoing':
      return 'მშენებარე'
    case 'planning':
      return 'დაგეგმილი'
    default:
      return status
  }
}
</script>

<template>
  <div class="projects-page">
    <!-- Hero Section -->
    <section
      class="relative h-[40vh] min-h-[300px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-orange-900"
    >
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-white">
          <div class="max-w-4xl">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight">
              {{ t('projects.title') }}
            </h1>
            <div class="w-24 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 mb-6"></div>
            <p class="text-lg md:text-xl text-orange-100 font-light leading-relaxed max-w-3xl">
              ჩვენი რეალიზებული და მშენებარე პროექტების კოლექცია
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter Section -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div class="text-center mb-8">
          <h2 class="text-3xl lg:text-4xl font-light mb-4 text-zinc-900">
            ფილტრი პროექტების მიხედვით
          </h2>
          <div class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto"></div>
        </div>

        <div class="flex flex-wrap gap-4 justify-center">
          <button
            v-for="category in categories"
            :key="category.value"
            @click="selectedCategory = category.value"
            class="px-8 py-3 rounded-full font-light text-lg transition-all duration-300 group"
            :class="
              selectedCategory === category.value
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:shadow-md'
            "
          >
            <span class="transition-all duration-300 group-hover:scale-105">
              {{ category.label }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Projects Grid -->
    <section class="py-12 lg:py-16 bg-gradient-to-br from-zinc-50 to-orange-50">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-20">
          <div
            class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-6"
          ></div>
          <p class="text-xl text-zinc-600 font-light">პროექტების ჩატვირთვა...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <div class="text-6xl mb-6">⚠️</div>
          <h2 class="text-2xl font-light text-zinc-800 mb-4">შეცდომა</h2>
          <p class="text-lg text-zinc-600 mb-8 font-light">{{ error }}</p>
          <button
            @click="() => loadProjectsAndUpdateStore(1, false)"
            class="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            კვლავ ცდა
          </button>
        </div>

        <!-- Projects Grid -->
        <div v-else>
          <!-- No Projects Found -->
          <div v-if="filteredProjects.length === 0" class="text-center py-20">
            <div class="text-6xl mb-6 text-zinc-400">🏗️</div>
            <h3 class="text-2xl font-light text-zinc-600 mb-4">
              ამ კატეგორიაში პროექტები არ მოიძებნა
            </h3>
            <p class="text-lg text-zinc-500 font-light">გთხოვთ, სცადოთ სხვა კატეგორია</p>
          </div>

          <!-- Projects Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div
              v-for="project in filteredProjects"
              :key="project.id"
              class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <!-- Project Image -->
              <div
                class="h-80 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center relative overflow-hidden"
              >
                <img
                  v-if="project.main_image"
                  :src="project.main_image"
                  :alt="project.title"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <div class="text-6xl text-zinc-400">
                    <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Overlay on hover -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>

                <!-- Status badge -->
                <div class="absolute top-6 left-6">
                  <span
                    class="px-4 py-2 rounded-full text-sm font-light"
                    :class="getStatusColor(project.status)"
                  >
                    {{ getStatusText(project.status) }}
                  </span>
                </div>

                <!-- Year badge -->
                <div class="absolute top-6 right-6">
                  <span
                    class="px-4 py-2 rounded-full text-sm font-light bg-white text-zinc-700 shadow-lg border border-gray-200"
                  >
                    {{ project.year }}
                  </span>
                </div>
              </div>

              <!-- Project Content -->
              <div class="p-6">
                <h3
                  class="text-xl font-light text-zinc-900 mb-3 group-hover:text-orange-600 transition-colors duration-300"
                >
                  {{ project.title }}
                </h3>

                <div class="flex items-center space-x-2 mb-4">
                  <svg
                    class="w-4 h-4 text-zinc-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="text-sm text-zinc-600 font-light">{{ project.location }}</span>
                </div>

                <router-link
                  :to="{ name: 'project-detail', params: { id: project.id } }"
                  class="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-light text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-300 group-hover:shadow-lg block text-center"
                >
                  {{ t('projects.details') }}
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Info -->
        <div v-if="filteredProjects.length > 0" class="text-center mt-12">
          <p class="text-zinc-600 font-light">
            ნაჩვენებია {{ filteredProjects.length }}
            {{ totalProjects > 1 ? 'პროექტიდან' : 'პროექტიდან' }}
            {{ totalProjects }}
          </p>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMorePages" class="text-center mt-8">
          <button
            @click="() => loadProjectsAndUpdateStore(currentPage + 1, true)"
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:from-orange-600 hover:to-orange-700 group"
          >
            <span class="mr-2">მეტი პროექტის ნახვა</span>
            <svg
              class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Luxury animations - removed conflicting transform */

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Custom gradient text */
.gradient-text {
  background: linear-gradient(135deg, #f97316, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced shadow effects */
.shadow-luxury {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Custom backdrop blur */
.backdrop-blur-luxury {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
