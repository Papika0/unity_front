<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              class="text-2xl sm:text-3xl md:text-4xl font-light bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2 tracking-tight"
            >
              {{ t('admin.translations.title') }}
            </h1>
            <p class="text-slate-600 text-sm sm:text-base md:text-lg font-light">{{ t('admin.translations.subtitle') }}</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            {{ t('admin.translations.add_new') }}
          </button>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
        <!-- Search Bar -->
        <SearchBar
          v-model="searchQuery"
          :placeholder="t('admin.translations.search_placeholder')"
          @update:model-value="debounceSearch"
        />

        <!-- Group Filter -->
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
        >
          <label class="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap"
            >{{ t('admin.translations.group_filter') }}</label
          >
          <div class="w-full sm:w-64">
            <CustomDropdown
              v-model="selectedGroup"
              :options="groupOptions"
              :placeholder="t('admin.translations.all_groups')"
              @update:model-value="handleGroupFilter"
            />
          </div>
          <button
            v-if="selectedGroup"
            @click="clearGroupFilter"
            class="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-all duration-200 whitespace-nowrap"
          >
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {{ t('admin.translations.clear_filter') }}
          </button>
        </div>
      </div>

      <!-- Translations Table -->
      <div class="mb-4">
        <!-- Filter Summary -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div class="text-xs sm:text-sm text-slate-700 font-medium">
            <span v-if="totalPages > 1"> {{ t('admin.translations.filter_summary', { current: currentPage, total: totalPages }) }} </span>
            <span> {{ t('admin.translations.total_count', { count: translations.length }) }} </span>
          </div>
          <div v-if="searchQuery || selectedGroup" class="flex items-center gap-2">
            <span class="text-xs text-slate-500">{{ t('admin.translations.active_filters') }}</span>
            <span
              v-if="searchQuery"
              class="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >
              🔍 "{{ searchQuery }}"
            </span>
            <span
              v-if="selectedGroup"
              class="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
            >
              {{ groupOptions.find((g) => g.value === selectedGroup)?.icon }}
              {{ groupOptions.find((g) => g.value === selectedGroup)?.label }}
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span class="text-slate-700 font-medium">{{ t('admin.translations.loading') }}</span>
          </div>
        </div>

        <!-- Translations Table -->
        <TranslationTable
          v-else
          :translations="translations"
          @edit="editTranslation"
          @delete="deleteTranslationConfirm"
        />
      </div>

      <!-- Pagination -->
      <div class="mt-8">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @previous="previousPage"
          @next="nextPage"
          @goto="goToPage"
        />
      </div>

      <!-- Create/Edit Modal -->
      <TranslationModal
        :is-open="showCreateModal || showEditModal"
        :is-edit="showEditModal"
        :form="translationForm"
        :saving="saving"
        :translating="translating"
        @close="closeModal"
        @submit="saveTranslation"
        @translate="translateText"
        @translateBoth="translateBoth"
        @update:form="updateForm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TranslationTable,
  TranslationModal,
  SearchBar,
  Pagination,
  CustomDropdown,
} from '@/components/admin'
import { useTranslationsList } from './composables'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

const {
  translations,
  showCreateModal,
  showEditModal,
  saving,
  translating,
  loading,
  searchQuery,
  selectedGroup,
  currentPage,
  totalPages,
  groupOptions,
  translationForm,
  debounceSearch,
  handleGroupFilter,
  clearGroupFilter,
  translateText,
  translateBoth,
  saveTranslation,
  editTranslation,
  deleteTranslationConfirm,
  closeModal,
  updateForm,
  nextPage,
  previousPage,
  goToPage,
} = useTranslationsList()
</script>

<style scoped>
.container {
  max-width: 1200px;
}

/* Custom scrollbar for light theme */
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

/* Gradient text animation */
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 6s ease-in-out infinite;
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}
</style>

<style scoped>
.container {
  max-width: 1200px;
}

/* Custom scrollbar for light theme */
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

/* Gradient text animation */
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 6s ease-in-out infinite;
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}
</style>
