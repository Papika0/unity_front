<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-light text-slate-900">საბანკო განაკვეთები / Bank Rates</h1>
        <p class="text-slate-600 mt-1">მართეთ სხვადასხვა ბანკების სესხის პირობები / Manage loan rates for different banks</p>
      </div>
      <button
        @click="openAddModal"
        class="group flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        ახალი ბანკი / Add Bank
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="bankRatesStore.loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="bankRatesStore.error" class="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
      <p class="text-red-600">{{ bankRatesStore.error }}</p>
      <button
        @click="bankRatesStore.loadBankRates()"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
      >
        ხელახლა ცდა / Retry
      </button>
    </div>

    <!-- Bank Rates Table -->
    <BankRatesTable
      v-else-if="bankRatesStore.bankRates.length > 0"
      :bank-rates="bankRatesStore.bankRates"
      @edit="openEditModal"
      @delete="confirmDelete"
      @toggle-active="toggleActive"
      @move-up="moveUp"
      @move-down="moveDown"
    />

    <!-- Empty State -->
    <div v-else class="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center">
      <svg class="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="text-xl font-medium text-slate-900 mb-2">არ არის ბანკები / No Banks</h3>
      <p class="text-slate-600 mb-6">დაამატეთ თქვენი პირველი საბანკო განაკვეთი / Add your first bank rate</p>
      <button
        @click="openAddModal"
        class="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg inline-flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        ახალი ბანკი / Add Bank
      </button>
    </div>

    <!-- Form Modal -->
    <BankRateFormModal
      v-model="showFormModal"
      :bank="editingBank"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import BankRateFormModal from './components/BankRateFormModal.vue'
import BankRatesTable from './components/BankRatesTable.vue'
import { useBankRatesList } from './composables'

const {
  bankRatesStore,
  showFormModal,
  editingBank,
  openAddModal,
  openEditModal,
  handleSave,
  toggleActive,
  confirmDelete,
  moveUp,
  moveDown,
} = useBankRatesList()
</script>
