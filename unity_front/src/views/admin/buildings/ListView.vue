<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="p-4 sm:p-6 md:p-8 font-sans text-slate-800">
      <!-- Header Section -->
      <div class="flex flex-col gap-4 mb-6 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <h1
            class="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent break-words leading-tight py-1"
          >
            შენობების მართვა
          </h1>
          <p class="mt-2 text-slate-600 text-sm sm:text-base md:text-lg">
            პროექტის შენობების შექმნა, რედაქტირება და წაშლა.
          </p>
        </div>

        <div class="flex-shrink-0">
          <button
            @click="openCreateModal"
            class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base w-full sm:w-auto"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            ახალი შენობის დამატება
          </button>
        </div>
      </div>

      <!-- Project Selector -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-slate-700 mb-2">აირჩიეთ პროექტი</label>
        <select
          v-model="selectedProjectId"
          @change="loadBuildings"
          class="w-full sm:w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
        >
          <option :value="null">-- აირჩიეთ პროექტი --</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.title }}
          </option>
        </select>
      </div>

      <!-- Loading State -->
      <div
        v-if="buildingsStore.isLoading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-pulse"
        >
          <div class="h-6 bg-slate-200 rounded mb-3"></div>
          <div class="h-4 bg-slate-200 rounded mb-2"></div>
          <div class="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="buildingsStore.error"
        class="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
      >
        <svg
          class="w-12 h-12 text-red-400 mx-auto mb-4"
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
        <p class="text-red-600 font-medium">{{ buildingsStore.error }}</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!selectedProjectId"
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center"
      >
        <svg
          class="w-16 h-16 text-slate-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          ></path>
        </svg>
        <p class="text-slate-500 text-lg">პროექტი არ არის არჩეული</p>
        <p class="text-slate-400 mt-2">გთხოვთ აირჩიოთ პროექტი ზემოთ</p>
      </div>

      <!-- Buildings Grid -->
      <div
        v-else-if="buildingsStore.buildings.length === 0"
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center"
      >
        <svg
          class="w-16 h-16 text-slate-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          ></path>
        </svg>
        <p class="text-slate-500 text-lg">შენობები არ მოიძებნა</p>
        <p class="text-slate-400 mt-2">დაამატეთ პირველი შენობა ამ პროექტისთვის</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="building in buildingsStore.buildings"
          :key="building.id"
          class="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
        >
          <div class="p-6">
            <!-- Building Name -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-slate-800 mb-1">{{ building.name_ka || building.name }}</h3>
                <p v-if="building.identifier" class="text-sm text-slate-500">
                  ID: {{ building.identifier }}
                </p>
              </div>
              <div class="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium">
                #{{ building.display_order }}
              </div>
            </div>

            <!-- Description -->
            <p v-if="building.description" class="text-slate-600 text-sm mb-4 line-clamp-2">
              {{ building.description }}
            </p>

            <!-- Apartments Count -->
            <div class="flex items-center gap-2 mb-4 text-slate-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              <span class="text-sm">
                <span class="font-semibold">{{ building.apartments_count || 0 }}</span> ბინა
              </span>
            </div>

            <!-- Actions -->
            <div class="space-y-2">
              <div class="flex gap-2">
                <button
                  @click="viewApartments(building)"
                  class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium text-sm"
                >
                  ბინები
                </button>
                <button
                  @click="editBuilding(building)"
                  class="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-medium text-sm"
                >
                  რედაქტირება
                </button>
                <button
                  @click="deleteBuilding(building)"
                  class="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 font-medium text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
              
              <button
                @click="editFloorZones(building)"
                class="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 font-medium text-sm"
              >
                <svg class="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7H4V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  ></path>
                </svg>
                სართულების რედაქტორი
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BuildingFormModal
      v-if="showModal"
      :building="selectedBuilding"
      :project-id="selectedProjectId"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuildingsAdminStore } from '@/stores/admin/buildings'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import type { Building } from '@/types/apartments'
import type { Project } from '@/types'
import BuildingFormModal from './components/BuildingFormModal.vue'

const router = useRouter()
const buildingsStore = useBuildingsAdminStore()
const projectsStore = useAdminProjectsStore()

const selectedProjectId = ref<number | null>(null)
const showModal = ref(false)
const selectedBuilding = ref<Building | null>(null)
const projects = ref<Project[]>([])

onMounted(async () => {
  // Load projects list
  try {
    await projectsStore.loadProjects()
    projects.value = projectsStore.projects
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
})

async function loadBuildings() {
  if (!selectedProjectId.value) return

  try {
    await buildingsStore.fetchBuildings(selectedProjectId.value)
  } catch (error) {
    console.error('Failed to load buildings:', error)
  }
}

function openCreateModal() {
  if (!selectedProjectId.value) {
    alert('გთხოვთ პირველ აირჩიოთ პროექტი')
    return
  }
  selectedBuilding.value = null
  showModal.value = true
}

function editBuilding(building: Building) {
  selectedBuilding.value = building
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedBuilding.value = null
}

function handleSaved() {
  closeModal()
  loadBuildings()
}

async function deleteBuilding(building: Building) {
  if (!confirm(`დარწმუნებული ხართ, რომ გსურთ შენობის "${building.name}" წაშლა?`)) {
    return
  }

  if (building.apartments_count && building.apartments_count > 0) {
    alert(
      `შეუძლებელია შენობის წაშლა, რადგან მას აქვს ${building.apartments_count} ბინა. პირველ წაშალეთ ყველა ბინა.`
    )
    return
  }

  try {
    await buildingsStore.deleteBuilding(selectedProjectId.value!, building.id)
    alert('შენობა წარმატებით წაიშალა')
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } }; message?: string }
    alert('შეცდომა: ' + (apiError.response?.data?.message || apiError.message))
  }
}

function viewApartments(building: Building) {
  router.push({
    name: 'admin-apartments',
    params: { projectId: selectedProjectId.value, buildingId: building.id },
  })
}

function editFloorZones(building: Building) {
  if (!selectedProjectId.value) return
  router.push({
    name: 'admin-zones-floor-strips',
    params: {
      id: selectedProjectId.value.toString(),
      buildingId: building.id.toString(),
    },
  })
}
</script>
