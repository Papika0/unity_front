<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">მარკეტინგის ელ. ფოსტები</h1>
        <p class="text-sm text-slate-600 mt-1">ელ. ფოსტების მართვა, რომლებზეც მოდის შეტყობინებები</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>დამატება</span>
      </button>
    </div>

    <!-- Filters -->
    <EmailsFilters
      :search="filters.search"
      :active="filters.active"
      :active-filter-options="activeFilterOptions"
      @update:search="filters.search = $event"
      @update:active="filters.active = $event"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <!-- Table -->
    <EmailsTable
      :emails="emails"
      :loading="loading"
      :pagination="pagination"
      @edit="openEditModal"
      @delete="deleteEmail"
      @toggle-active="toggleActive"
      @change-page="changePage"
    />

    <!-- Create/Edit Modal -->
    <EmailFormModal
      :show="showModal"
      :is-edit="!!editingEmail"
      :form-data="formData"
      @close="closeModal"
      @save="saveEmail"
      @update:form-data="formData = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { EmailsTable, EmailsFilters, EmailFormModal } from './components'
import { useMarketingEmails } from './composables'

const {
  // State
  emails,
  loading,
  showModal,
  editingEmail,
  formData,
  filters,
  pagination,
  activeFilterOptions,

  // Actions
  openCreateModal,
  openEditModal,
  closeModal,
  saveEmail,
  toggleActive,
  deleteEmail,
  applyFilters,
  resetFilters,
  changePage,
} = useMarketingEmails()
</script>
