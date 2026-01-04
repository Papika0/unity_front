<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
    <div class="p-4 sm:p-6 md:p-8 font-sans text-slate-800">
      <!-- Header Section -->
      <div class="flex flex-col gap-4 mb-6 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent break-words leading-tight py-1">{{ t('admin.sidebar.apartments') }}</h1>
          <p class="mt-2 text-slate-600 text-sm sm:text-base md:text-lg">{{ t('admin.sidebar.apartments') }}</p>
        </div>
        <div class="flex-shrink-0 flex gap-2 flex-wrap">
          <button @click="showBatchImageUpload = true" :disabled="!selectedProjectId || !selectedBuildingId" class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {{ t('apartments.batch_upload_images') }}
          </button>
          <button @click="showImportModal = true" :disabled="!selectedProjectId" class="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            {{ t('admin.common.upload') }}
          </button>
          <button @click="openCreateModal" :disabled="!selectedProjectId" class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            {{ t('admin.common.add') }}
          </button>
        </div>
      </div>

      <!-- Batch Actions Toolbar -->
      <Transition name="slide-down">
        <div v-if="selectedApartmentIds.length > 0" class="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <span class="font-medium text-emerald-800">
              {{ selectedApartmentIds.length }} {{ t('apartments.apartments_selected') }}
            </span>
            <button @click="clearSelection" class="text-emerald-600 hover:text-emerald-800 text-sm underline">
              {{ t('admin.common.clear_selection') }}
            </button>
          </div>
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <label class="text-sm font-medium text-slate-700">{{ t('admin.common.change_status') }}:</label>
            <select v-model="bulkStatusValue" class="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto">
              <option value="">-- {{ t('admin.common.select_status') }} --</option>
              <option value="available">{{ t('status.available') }}</option>
              <option value="reserved">{{ t('status.reserved') }}</option>
              <option value="sold">{{ t('status.sold') }}</option>
            </select>
            <button
              @click="applyBulkStatusChange"
              :disabled="!bulkStatusValue || isApplyingBulkStatus"
              class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <span v-if="!isApplyingBulkStatus">{{ t('admin.common.apply') }}</span>
              <span v-else class="flex items-center gap-2 justify-center">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ t('admin.common.applying') }}
              </span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Filters -->
      <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.sidebar.projects') }}</label>
          <select v-model="selectedProjectId" @change="onProjectChange" class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900">
            <option :value="null">-- {{ t('admin.features.select_project') }} --</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.title }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.sidebar.buildings') }}</label>
          <select v-model="selectedBuildingId" @change="loadApartments" :disabled="!selectedProjectId" class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 text-gray-900">
            <option :value="null">-- {{ t('admin.common.select_all') }} --</option>
            <option v-for="building in buildings" :key="building.id" :value="building.id">{{ building.name_ka || building.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.common.status') }}</label>
          <select v-model="filterStatus" @change="loadApartments" class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900">
            <option :value="null">-- {{ t('admin.common.select_all') }} --</option>
            <option value="available">{{ t('status.available') }}</option>
            <option value="reserved">{{ t('status.reserved') }}</option>
            <option value="sold">{{ t('status.sold') }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.common.search') }}</label>
          <input v-model="searchQuery" @input="loadApartments" type="text" :placeholder="t('apartments.apartment') + '...'" class="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900" />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="apartmentsStore.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="n in 8" :key="n" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-pulse">
          <div class="h-6 bg-slate-200 rounded mb-3"></div>
          <div class="h-4 bg-slate-200 rounded mb-2"></div>
          <div class="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="apartmentsStore.error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-600 font-medium">{{ apartmentsStore.error }}</p>
      </div>

      <!-- Empty State: No Project -->
      <div v-else-if="!selectedProjectId" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <p class="text-slate-500 text-lg">{{ t('admin.features.select_project') }}</p>
      </div>

      <!-- Empty State: No Apartments -->
      <div v-else-if="apartmentsStore.apartments.length === 0" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <p class="text-slate-500 text-lg">{{ t('apartments.no_apartments') }}</p>
      </div>

      <!-- Select All Bar -->
      <div v-else-if="apartmentsStore.apartments.length > 0" class="mb-4 flex items-center gap-3 px-4">
        <input
          type="checkbox"
          :checked="isAllSelected"
          @change="toggleSelectAll"
          class="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
        />
        <label class="text-sm font-medium text-slate-700 cursor-pointer select-none" @click="toggleSelectAll">
          {{ isAllSelected ? t('admin.common.deselect_all') : t('admin.common.select_all') }}
          ({{ apartmentsStore.apartments.length }})
        </label>
      </div>

      <!-- Apartments Grid -->
      <div v-if="apartmentsStore.apartments.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="apartment in apartmentsStore.apartments" :key="apartment.id" class="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <!-- Checkbox -->
              <input
                type="checkbox"
                :checked="selectedApartmentIds.includes(apartment.id)"
                @change="toggleApartmentSelection(apartment.id)"
                class="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer flex-shrink-0 mt-1"
              />

              <div class="flex-1 ml-3">
                <h3 class="text-xl font-bold text-slate-800">{{ apartment.apartment_number }}</h3>
                <p class="text-sm text-slate-500">{{ t('apartments.floor') }}: {{ apartment.floor_number }}</p>
              </div>
              <span :class="getStatusClass(apartment.status)" class="px-3 py-1 rounded-lg text-sm font-medium">{{ getStatusLabel(apartment.status) }}</span>
            </div>
            <div class="space-y-2 mb-4">
              <div v-if="apartment.price" class="flex items-center gap-2 text-slate-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="text-sm font-semibold">{{ formatPrice(apartment.price) }}</span>
              </div>
              <div v-if="apartment.area_total" class="flex items-center gap-2 text-slate-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" /></svg>
                <span class="text-sm">{{ apartment.area_total }} {{ t('common.sqm') }}</span>
              </div>
              <div v-if="apartment.bedrooms" class="flex items-center gap-2 text-slate-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span class="text-sm">{{ apartment.bedrooms }} {{ t('apartments.bedrooms') }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="editApartment(apartment)" class="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-medium text-sm">{{ t('admin.common.edit') }}</button>
              <button @click="deleteApartment(apartment)" class="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 font-medium text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="apartmentsStore.apartments.length > 0" class="mt-8 flex justify-center">
        <div class="flex gap-2">
          <button v-for="page in totalPages" :key="page" @click="currentPage = page; loadApartments()" :class="['px-4 py-2 rounded-lg font-medium transition-all', currentPage === page ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100']">{{ page }}</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <ApartmentFormModal v-if="showFormModal" :apartment="selectedApartment" :project-id="selectedProjectId" :buildings="buildings" @close="closeFormModal" @saved="handleSaved" />

    <!-- Import Modal -->
    <ApartmentImportModal v-if="showImportModal" :project-id="selectedProjectId" :buildings="buildings" @close="showImportModal = false" @imported="handleImported" />

    <!-- Batch Image Upload Modal -->
    <ApartmentBatchImageUploadModal
      :show="showBatchImageUpload"
      :project-id="selectedProjectId"
      :building-id="selectedBuildingId"
      @close="showBatchImageUpload = false"
      @uploaded="handleBatchImageUploaded"
    />

    <!-- Batch Status Confirmation Modal -->
    <Transition name="fade">
      <div v-if="showBulkConfirmation" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="cancelBulkStatusChange">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-slate-800">{{ t('admin.common.confirm_action') }}</h3>
            <button @click="cancelBulkStatusChange" class="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>

          <div class="mb-6">
            <p class="text-slate-600 mb-4">
              {{ t('apartments.confirm_batch_status_change', { count: selectedApartmentIds.length }) }}
            </p>
            <div class="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
              <strong>{{ t('apartments.apartments_selected') }}:</strong>
              {{ selectedApartmentIds.length }}
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="cancelBulkStatusChange"
              class="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              {{ t('admin.common.cancel') }}
            </button>
            <button
              @click="confirmBulkStatusChange"
              :disabled="isApplyingBulkStatus"
              class="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50"
            >
              {{ t('admin.common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import ApartmentFormModal from './components/ApartmentFormModal.vue'
import ApartmentImportModal from './components/ApartmentImportModal.vue'
import ApartmentBatchImageUploadModal from './components/ApartmentBatchImageUploadModal.vue'
import { useApartmentsList } from './composables'

const { t } = useTranslations()

// Batch image upload state
const showBatchImageUpload = ref(false)

const {
  apartmentsStore,
  selectedProjectId,
  selectedBuildingId,
  filterStatus,
  searchQuery,
  currentPage,
  showFormModal,
  showImportModal,
  selectedApartment,
  projects,
  buildings,
  totalPages,
  selectedApartmentIds,
  bulkStatusValue,
  isApplyingBulkStatus,
  showBulkConfirmation,
  isAllSelected,
  onProjectChange,
  loadApartments,
  openCreateModal,
  editApartment,
  closeFormModal,
  handleSaved,
  handleImported,
  deleteApartment,
  toggleApartmentSelection,
  toggleSelectAll,
  clearSelection,
  applyBulkStatusChange,
  cancelBulkStatusChange,
  confirmBulkStatusChange,
  getStatusClass,
  getStatusLabel,
  formatPrice,
} = useApartmentsList()

// Handle batch image upload completion
function handleBatchImageUploaded() {
  loadApartments()
  showBatchImageUpload.value = false
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
