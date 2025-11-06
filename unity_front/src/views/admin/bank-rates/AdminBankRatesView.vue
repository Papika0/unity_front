<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-light text-slate-900">
          საბანკო განაკვეთები / Bank Rates
        </h1>
        <p class="text-slate-600 mt-1">
          მართეთ სხვადასხვა ბანკების სესხის პირობები / Manage loan rates for different banks
        </p>
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
    <div
      v-else-if="bankRatesStore.bankRates.length > 0"
      class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
    >
      <table class="w-full">
        <thead class="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
          <tr>
            <th class="px-6 py-4 text-left font-semibold">ბანკი / Bank</th>
            <th class="px-6 py-4 text-center font-semibold">განაკვეთი / Rate (%)</th>
            <th class="px-6 py-4 text-center font-semibold">ვადა / Term (years)</th>
            <th class="px-6 py-4 text-center font-semibold">მინ. შენატანი / Min. Down (%)</th>
            <th class="px-6 py-4 text-center font-semibold">სტატუსი / Status</th>
            <th class="px-6 py-4 text-center font-semibold">მოქმედებები / Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(bank, idx) in bankRatesStore.bankRates"
            :key="bank.id"
            :class="idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'"
            class="hover:bg-amber-100 transition-colors"
          >
            <!-- Bank Name -->
            <td class="px-6 py-4">
              <div class="font-medium text-slate-900">{{ bank.bank_name }}</div>
              <div class="text-sm text-slate-500 mt-1">
                🇬🇪 {{ bank.bank_name_ka }}
              </div>
            </td>

            <!-- Interest Rate -->
            <td class="px-6 py-4 text-center">
              <span class="inline-block px-4 py-2 bg-amber-500 text-white rounded-full font-semibold text-lg">
                {{ bank.interest_rate }}%
              </span>
            </td>

            <!-- Loan Term -->
            <td class="px-6 py-4 text-center text-slate-700 font-medium">
              {{ bank.min_loan_term_years }} - {{ bank.max_loan_term_years }}
            </td>

            <!-- Min Down Payment -->
            <td class="px-6 py-4 text-center text-slate-700 font-medium">
              {{ bank.min_down_payment_percent }}%
            </td>

            <!-- Status -->
            <td class="px-6 py-4 text-center">
              <button
                @click="toggleActive(bank)"
                :class="[
                  'inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all',
                  bank.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                <span class="w-2 h-2 rounded-full mr-2" :class="bank.is_active ? 'bg-green-500' : 'bg-slate-400'"></span>
                {{ bank.is_active ? 'აქტიური / Active' : 'არააქტიური / Inactive' }}
              </button>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <!-- Edit -->
                <button
                  @click="openEditModal(bank)"
                  class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                  title="Edit"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                <!-- Delete -->
                <button
                  @click="confirmDelete(bank)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>

                <!-- Move Up -->
                <button
                  @click="moveUp(idx)"
                  :disabled="idx === 0"
                  class="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                <!-- Move Down -->
                <button
                  @click="moveDown(idx)"
                  :disabled="idx === bankRatesStore.bankRates.length - 1"
                  class="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center"
    >
      <svg class="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      <h3 class="text-xl font-medium text-slate-900 mb-2">
        არ არის ბანკები / No Banks
      </h3>
      <p class="text-slate-600 mb-6">
        დაამატეთ თქვენი პირველი საბანკო განაკვეთი / Add your first bank rate
      </p>
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
import { ref, onMounted } from 'vue'
import { useBankRatesStore } from '@/stores/admin/bankRates'
import BankRateFormModal from './components/BankRateFormModal.vue'
import type { BankRate, BankRateFormData } from '@/types/admin/calculator'

const bankRatesStore = useBankRatesStore()

const showFormModal = ref(false)
const editingBank = ref<BankRate | null>(null)

onMounted(() => {
  bankRatesStore.loadBankRates()
})

const openAddModal = () => {
  editingBank.value = null
  showFormModal.value = true
}

const openEditModal = (bank: BankRate) => {
  editingBank.value = bank
  showFormModal.value = true
}

const handleSave = async (data: BankRateFormData, bankId?: number) => {
  let result
  if (bankId) {
    result = await bankRatesStore.updateBankRate(bankId, data)
  } else {
    result = await bankRatesStore.createBankRate(data)
  }

  if (result.success) {
    showFormModal.value = false
    editingBank.value = null
  }
}

const toggleActive = async (bank: BankRate) => {
  await bankRatesStore.toggleActive(bank.id)
}

const confirmDelete = async (bank: BankRate) => {
  if (confirm(`დარწმუნებული ხართ, რომ გსურთ წაშალოთ ${bank.bank_name}?\n\nAre you sure you want to delete ${bank.bank_name}?`)) {
    await bankRatesStore.deleteBankRate(bank.id)
  }
}

const moveUp = (index: number) => {
  bankRatesStore.moveBankRateUp(index)
  saveOrder()
}

const moveDown = (index: number) => {
  bankRatesStore.moveBankRateDown(index)
  saveOrder()
}

const saveOrder = async () => {
  const orderedIds = bankRatesStore.bankRates.map(b => b.id)
  await bankRatesStore.reorderBankRates(orderedIds)
}
</script>
