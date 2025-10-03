<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50">
    <div class="p-4 sm:p-6 md:p-8 font-sans text-slate-800">
      <!-- Header Section -->
      <div class="flex flex-col gap-4 mb-6 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <h1
            class="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent break-words leading-tight py-1"
          >
            პროექტები
          </h1>
          <p class="mt-2 text-slate-600 text-sm sm:text-base md:text-lg">
            პროექტების მართვა, შექმნა, რედაქტირება და წაშლა.
          </p>
        </div>

        <div class="flex-shrink-0 flex flex-col gap-2 sm:gap-3">
          <button
            @click="goToAddProject"
            class="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base w-full sm:w-auto"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            ახალი პროექტის დამატება
          </button>

          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              @click="openFeaturedModal"
              class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base"
            >
              სლაიდის პროექტები
            </button>
            <button
              @click="openHomepageModal"
              class="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base"
            >
              რჩეული პროექტები
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse"
        >
          <div class="w-full h-40 sm:h-48 bg-slate-200"></div>
          <div class="p-4 sm:p-6">
            <div class="h-5 sm:h-6 bg-slate-200 rounded mb-2 sm:mb-3"></div>
            <div class="h-3 sm:h-4 bg-slate-200 rounded mb-2"></div>
            <div class="h-3 sm:h-4 bg-slate-200 rounded w-3/4 mb-3 sm:mb-4"></div>
            <div class="flex gap-2">
              <div class="h-8 sm:h-9 bg-slate-200 rounded flex-1"></div>
              <div class="h-8 sm:h-9 bg-slate-200 rounded w-16 sm:w-20"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
        <svg
          class="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3 sm:mb-4"
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
        <h3 class="text-base sm:text-lg font-medium text-red-800 mb-2">პროექტების ჩატვირთვის შეცდომა</h3>
        <p class="text-sm sm:text-base text-red-600">{{ error }}</p>
        <button
          @click="adminProjectsStore.loadProjects()"
          class="mt-3 sm:mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm sm:text-base"
        >
          ხელახლა ცდა
        </button>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="project in projects"
          :key="project.id"
          class="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-200"
        >
          <!-- Project Image -->
          <div class="relative overflow-hidden">
            <img
              v-if="project.main_image"
              :src="getImageUrl(project.main_image)"
              :alt="project.title"
              class="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              v-else
              class="w-full h-40 sm:h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center"
            >
              <svg
                class="h-12 w-12 sm:h-16 sm:w-16 text-amber-300"
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

            <!-- Status Badge -->
            <div class="absolute top-2 sm:top-3 right-2 sm:right-3">
              <span
                :class="
                  project.is_active
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                "
                class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm border"
              >
                <svg
                  v-if="project.is_active"
                  class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <svg v-else class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                {{ project.is_active ? 'აქტიური' : 'არააქტიური' }}
              </span>
            </div>

            <!-- Featured Badge -->
            <div v-if="project.is_featured" class="absolute top-2 sm:top-3 left-2 sm:left-3">
              <span
                class="bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm border border-yellow-200"
              >
                <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  ></path>
                </svg>
                რჩეული
              </span>
            </div>

            <!-- Overlay on hover -->
            <div
              class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"
            ></div>
          </div>

          <!-- Project Content -->
          <div class="p-4 sm:p-6 flex-1 flex flex-col">
            <h2
              class="text-base sm:text-xl font-bold mb-2 sm:mb-3 text-slate-900 group-hover:text-amber-600 transition-colors duration-200 break-words"
            >
              {{ project.title }}
            </h2>

            <p class="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 flex-none leading-relaxed line-clamp-3">
              {{ truncate(project.description, 120) }}
            </p>

            <!-- Project Details -->
            <div class="bg-slate-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex-none space-y-2 sm:space-y-3">
              <div class="grid grid-cols-1 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div>
                  <span class="font-medium text-slate-700">სტატუსი:</span>
                  <div class="mt-1">
                    <span
                      :class="
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      "
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ project.status_name }}
                    </span>
                  </div>
                </div>

                <div v-if="project.location">
                  <span class="font-medium text-slate-700">მდებარეობა:</span>
                  <div class="text-slate-600 mt-1">{{ project.location }}</div>
                </div>

                <div>
                  <span class="font-medium text-slate-700">შექმნის თარიღი:</span>
                  <div class="text-slate-600 mt-1">{{ formatDate(project.created_at) }}</div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-auto">
              <button
                @click.stop="goToDetail(project.id)"
                class="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                <svg
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  ></path>
                </svg>
                დეტალურად ნახვა
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Projects Modal -->
      <div
        v-if="showFeaturedModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
        @click.self="cancelFeaturedSelection"
      >
        <div
          class="bg-white/95 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 border border-slate-200/50 max-h-[90vh] flex flex-col"
        >
          <div class="p-4 sm:p-6 md:p-8 border-b border-slate-200/50 flex items-center justify-between flex-shrink-0">
            <h2 class="text-base sm:text-lg md:text-xl font-bold text-slate-800">რჩეული პროექტების არჩევა</h2>
            <button @click="cancelFeaturedSelection" class="text-slate-400 hover:text-slate-600 text-xl sm:text-2xl">
              ✕
            </button>
          </div>
          <div class="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
            <div class="grid grid-cols-1 gap-3 sm:gap-4">
              <div
                v-for="project in projects"
                :key="project.id"
                class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer"
                :class="
                  selectedFeaturedIds.includes(project.id) ? 'bg-yellow-50 border-amber-400' : ''
                "
                @click="toggleFeaturedSelection(project.id)"
              >
                <img
                  v-if="project.main_image"
                  :src="getImageUrl(project.main_image)"
                  class="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg sm:rounded-xl flex-shrink-0"
                />
                <div
                  v-else
                  class="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-6 h-6 sm:w-8 sm:h-8 text-amber-300"
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
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-slate-800 text-sm sm:text-base truncate">{{ project.title }}</div>
                  <div class="text-slate-500 text-xs sm:text-sm truncate">{{ truncate(project.description, 60) }}</div>
                </div>
                <span
                  v-if="selectedFeaturedIds.includes(project.id)"
                  class="px-2 py-1 rounded bg-yellow-200 text-yellow-800 text-xs font-bold flex-shrink-0"
                  >{{ selectedFeaturedIds.indexOf(project.id) + 1 }}</span
                >
                <input
                  type="checkbox"
                  :checked="selectedFeaturedIds.includes(project.id)"
                  @change.stop="toggleFeaturedSelection(project.id)"
                  class="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                />
              </div>
            </div>
          </div>
          <div class="p-4 sm:p-6 md:p-8 border-t border-slate-200/50 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end flex-shrink-0">
            <button
              @click="cancelFeaturedSelection"
              class="px-4 sm:px-6 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm sm:text-base order-2 sm:order-1"
            >
              გაუქმება
            </button>
            <button
              @click="saveFeaturedProjects"
              :disabled="savingFeatured"
              class="px-4 sm:px-6 py-2 rounded-xl bg-yellow-500 text-white font-bold shadow hover:bg-yellow-600 text-sm sm:text-base order-1 sm:order-2"
            >
              შენახვა
            </button>
          </div>
        </div>
      </div>

      <!-- Homepage Projects Modal -->
      <div
        v-if="showHomepageModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
        @click.self="cancelHomepageSelection"
      >
        <div
          class="bg-white/95 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 border border-slate-200/50 max-h-[90vh] flex flex-col"
        >
          <div class="p-4 sm:p-6 md:p-8 border-b border-slate-200/50 flex items-center justify-between flex-shrink-0">
            <h2 class="text-base sm:text-lg md:text-xl font-bold text-slate-800">მთავარი პროექტების არჩევა</h2>
            <button @click="cancelHomepageSelection" class="text-slate-400 hover:text-slate-600 text-xl sm:text-2xl">
              ✕
            </button>
          </div>
          <div class="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
            <div class="grid grid-cols-1 gap-3 sm:gap-4">
              <div
                v-for="project in projects"
                :key="project.id"
                class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer"
                :class="
                  selectedHomepageIds.includes(project.id) ? 'bg-blue-50 border-blue-400' : ''
                "
                @click="toggleHomepageSelection(project.id)"
              >
                <img
                  v-if="project.main_image"
                  :src="getImageUrl(project.main_image)"
                  class="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg sm:rounded-xl flex-shrink-0"
                />
                <div
                  v-else
                  class="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-6 h-6 sm:w-8 sm:h-8 text-blue-300"
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
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-slate-800 text-sm sm:text-base truncate">{{ project.title }}</div>
                  <div class="text-slate-500 text-xs sm:text-sm truncate">{{ truncate(project.description, 60) }}</div>
                </div>
                <span
                  v-if="selectedHomepageIds.includes(project.id)"
                  class="px-2 py-1 rounded bg-blue-200 text-blue-800 text-xs font-bold flex-shrink-0"
                  >{{ selectedHomepageIds.indexOf(project.id) + 1 }}</span
                >
                <input
                  type="checkbox"
                  :checked="selectedHomepageIds.includes(project.id)"
                  @change.stop="toggleHomepageSelection(project.id)"
                  class="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                />
              </div>
            </div>
          </div>
          <div class="p-4 sm:p-6 md:p-8 border-t border-slate-200/50 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end flex-shrink-0">
            <button
              @click="cancelHomepageSelection"
              class="px-4 sm:px-6 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm sm:text-base order-2 sm:order-1"
            >
              გაუქმება
            </button>
            <button
              @click="saveHomepageProjects"
              :disabled="savingHomepage"
              class="px-4 sm:px-6 py-2 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 text-sm sm:text-base order-1 sm:order-2"
            >
              შენახვა
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import { getImageUrl } from '@/utils/imageUrl'

const router = useRouter()
const adminProjectsStore = useAdminProjectsStore()

// Use computed properties from the store
const projects = computed(() => adminProjectsStore.filteredProjects)
const loading = computed(() => adminProjectsStore.loading)
const error = computed(() => adminProjectsStore.error)

// Featured projects modal state
const showFeaturedModal = ref(false)
const showHomepageModal = ref(false)
const selectedFeaturedIds = ref<number[]>([])
const selectedHomepageIds = ref<number[]>([])
const savingFeatured = ref(false)
const savingHomepage = ref(false)

// Open featured projects modal
function openFeaturedModal() {
  showFeaturedModal.value = true
  selectedFeaturedIds.value = projects.value.filter((p) => p.is_featured).map((p) => p.id)
}

// Cancel featured projects selection
function cancelFeaturedSelection() {
  showFeaturedModal.value = false
  selectedFeaturedIds.value = []
}

// Toggle project selection for featured projects
function toggleFeaturedSelection(id: number) {
  const idx = selectedFeaturedIds.value.indexOf(id)
  if (idx > -1) {
    selectedFeaturedIds.value.splice(idx, 1)
  } else if (selectedFeaturedIds.value.length < 3) {
    selectedFeaturedIds.value.push(id)
  }
}

// Save featured projects
async function saveFeaturedProjects() {
  savingFeatured.value = true
  try {
    // Pass the selected IDs to the store method
    await adminProjectsStore.updateFeaturedProjects(selectedFeaturedIds.value)
    showFeaturedModal.value = false
    selectedFeaturedIds.value = []
  } finally {
    savingFeatured.value = false
  }
}

function openHomepageModal() {
  showHomepageModal.value = true
  selectedHomepageIds.value = projects.value.filter((p) => p.is_onHomepage).map((p) => p.id)
}

function cancelHomepageSelection() {
  showHomepageModal.value = false
  selectedHomepageIds.value = []
}

function toggleHomepageSelection(id: number) {
  const idx = selectedHomepageIds.value.indexOf(id)
  if (idx > -1) {
    selectedHomepageIds.value.splice(idx, 1)
  } else if (selectedHomepageIds.value.length < 3) {
    selectedHomepageIds.value.push(id)
  }
}

async function saveHomepageProjects() {
  savingHomepage.value = true
  try {
    await adminProjectsStore.updateHomepageProjects(selectedHomepageIds.value)
    showHomepageModal.value = false
    selectedHomepageIds.value = []
  } finally {
    savingHomepage.value = false
  }
}

function goToAddProject() {
  router.push({ name: 'admin-project-add' })
}

const goToDetail = (id: number) => {
  router.push({ name: 'admin-project-detail', params: { id: id.toString() } })
}

const formatDate = (dateString: string) => {
  const dt = new Date(dateString)
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

const truncate = (str: string, len: number) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

onMounted(() => {
  adminProjectsStore.initialize()
})
</script>
