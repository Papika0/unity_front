<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50">
    <div class="p-4 sm:p-6 md:p-8 font-sans text-slate-800">
      <!-- Header Section -->
      <div class="flex flex-col gap-4 mb-6 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600">
            პროექტების მართვა
          </h1>
          <p class="mt-2 text-slate-600 text-sm sm:text-base md:text-lg">პროექტების მართვა, შექმნა, რედაქტირება და წაშლა.</p>
        </div>
        <div class="flex-shrink-0 flex flex-col gap-2 sm:gap-3">
          <button @click="goToAddProject" class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            ახალი პროექტის დამატება
          </button>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button @click="openFeaturedModal" class="bg-white/80 backdrop-blur border border-slate-200 text-slate-700 px-3 sm:px-4 py-2 rounded-xl hover:bg-yellow-50 hover:border-yellow-400 transition-all font-medium text-sm sm:text-base">
              რჩეული პროექტები
            </button>
            <button @click="openHomepageModal" class="bg-white/80 backdrop-blur border border-slate-200 text-slate-700 px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all font-medium text-sm sm:text-base">
              მთავარი პროექტები
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div v-for="n in 6" :key="n" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
          <div class="h-40 sm:h-48 bg-slate-200"></div>
          <div class="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div class="h-5 sm:h-6 bg-slate-200 rounded w-3/4"></div>
            <div class="h-3 sm:h-4 bg-slate-200 rounded w-full"></div>
            <div class="flex gap-2"><div class="h-8 sm:h-9 bg-slate-200 rounded flex-1"></div><div class="h-8 sm:h-9 bg-slate-200 rounded w-16 sm:w-20"></div></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
        <svg class="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-red-600 text-sm sm:text-base">{{ error }}</p>
        <button @click="initialize" class="mt-3 sm:mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm sm:text-base">ხელახლა ცდა</button>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @view-detail="goToDetail"
          @edit-zones="goToZonesEditor"
        />
      </div>

      <!-- Featured Projects Modal -->
      <div v-if="showFeaturedModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" @click.self="cancelFeaturedSelection">
        <div class="bg-white/95 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 border border-slate-200/50 max-h-[90vh] flex flex-col">
          <div class="p-4 sm:p-6 md:p-8 border-b border-slate-200/50 flex items-center justify-between flex-shrink-0">
            <h2 class="text-base sm:text-lg md:text-xl font-bold text-slate-800">რჩეული პროექტების არჩევა</h2>
            <button @click="cancelFeaturedSelection" class="text-slate-400 hover:text-slate-600 text-xl sm:text-2xl">✕</button>
          </div>
          <div class="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
            <div class="grid grid-cols-1 gap-3 sm:gap-4">
              <div v-for="project in projects" :key="project.id" class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer" :class="selectedFeaturedIds.includes(project.id) ? 'bg-yellow-50 border-amber-400' : ''" @click="toggleFeaturedSelection(project.id)">
                <img v-if="project.main_image" :src="getImageUrl(project.main_image)" class="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg sm:rounded-xl flex-shrink-0" />
                <div v-else class="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 sm:w-8 sm:h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-slate-800 text-sm sm:text-base truncate">{{ project.title }}</div>
                  <div class="text-slate-500 text-xs sm:text-sm truncate">{{ truncate(project.description, 60) }}</div>
                </div>
                <span v-if="selectedFeaturedIds.includes(project.id)" class="px-2 py-1 rounded bg-yellow-200 text-yellow-800 text-xs font-bold flex-shrink-0">{{ selectedFeaturedIds.indexOf(project.id) + 1 }}</span>
                <input type="checkbox" :checked="selectedFeaturedIds.includes(project.id)" @change.stop="toggleFeaturedSelection(project.id)" class="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
          <div class="p-4 sm:p-6 md:p-8 border-t border-slate-200/50 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end flex-shrink-0">
            <button @click="cancelFeaturedSelection" class="px-4 sm:px-6 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm sm:text-base order-2 sm:order-1">გაუქმება</button>
            <button @click="saveFeaturedProjects" :disabled="savingFeatured" class="px-4 sm:px-6 py-2 rounded-xl bg-yellow-500 text-white font-bold shadow hover:bg-yellow-600 text-sm sm:text-base order-1 sm:order-2">შენახვა</button>
          </div>
        </div>
      </div>

      <!-- Homepage Projects Modal -->
      <div v-if="showHomepageModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" @click.self="cancelHomepageSelection">
        <div class="bg-white/95 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 border border-slate-200/50 max-h-[90vh] flex flex-col">
          <div class="p-4 sm:p-6 md:p-8 border-b border-slate-200/50 flex items-center justify-between flex-shrink-0">
            <h2 class="text-base sm:text-lg md:text-xl font-bold text-slate-800">მთავარი პროექტების არჩევა</h2>
            <button @click="cancelHomepageSelection" class="text-slate-400 hover:text-slate-600 text-xl sm:text-2xl">✕</button>
          </div>
          <div class="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
            <div class="grid grid-cols-1 gap-3 sm:gap-4">
              <div v-for="project in projects" :key="project.id" class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer" :class="selectedHomepageIds.includes(project.id) ? 'bg-blue-50 border-blue-400' : ''" @click="toggleHomepageSelection(project.id)">
                <img v-if="project.main_image" :src="getImageUrl(project.main_image)" class="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg sm:rounded-xl flex-shrink-0" />
                <div v-else class="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 sm:w-8 sm:h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-slate-800 text-sm sm:text-base truncate">{{ project.title }}</div>
                  <div class="text-slate-500 text-xs sm:text-sm truncate">{{ truncate(project.description, 60) }}</div>
                </div>
                <span v-if="selectedHomepageIds.includes(project.id)" class="px-2 py-1 rounded bg-blue-200 text-blue-800 text-xs font-bold flex-shrink-0">{{ selectedHomepageIds.indexOf(project.id) + 1 }}</span>
                <input type="checkbox" :checked="selectedHomepageIds.includes(project.id)" @change.stop="toggleHomepageSelection(project.id)" class="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
          <div class="p-4 sm:p-6 md:p-8 border-t border-slate-200/50 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end flex-shrink-0">
            <button @click="cancelHomepageSelection" class="px-4 sm:px-6 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm sm:text-base order-2 sm:order-1">გაუქმება</button>
            <button @click="saveHomepageProjects" :disabled="savingHomepage" class="px-4 sm:px-6 py-2 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 text-sm sm:text-base order-1 sm:order-2">შენახვა</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImageUrl } from '@/utils/imageUrl'
import { ProjectCard } from './components'
import { useProjectsList } from './composables'

const {
  projects,
  loading,
  error,
  showFeaturedModal,
  showHomepageModal,
  selectedFeaturedIds,
  selectedHomepageIds,
  savingFeatured,
  savingHomepage,
  openFeaturedModal,
  cancelFeaturedSelection,
  toggleFeaturedSelection,
  saveFeaturedProjects,
  openHomepageModal,
  cancelHomepageSelection,
  toggleHomepageSelection,
  saveHomepageProjects,
  goToAddProject,
  goToDetail,
  goToZonesEditor,
  truncate,
  initialize,
} = useProjectsList()
</script>
