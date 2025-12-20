/**
 * useBankRatesList - Composable for admin bank rates management
 * Handles CRUD operations, reordering, and modal state
 */

import { ref, onMounted } from 'vue'
import { useBankRatesStore } from '@/stores/admin/bankRates'
import type { BankRate, BankRateFormData } from '@/types/admin/calculator'

export function useBankRatesList() {
  // ============================================
  // STORES
  // ============================================
  const bankRatesStore = useBankRatesStore()

  // ============================================
  // STATE
  // ============================================
  const showFormModal = ref(false)
  const editingBank = ref<BankRate | null>(null)

  // ============================================
  // MODAL ACTIONS
  // ============================================
  const openAddModal = () => {
    editingBank.value = null
    showFormModal.value = true
  }

  const openEditModal = (bank: BankRate) => {
    editingBank.value = bank
    showFormModal.value = true
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================
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

  // ============================================
  // REORDERING
  // ============================================
  const saveOrder = async () => {
    const orderedIds = bankRatesStore.bankRates.map(b => b.id)
    await bankRatesStore.reorderBankRates(orderedIds)
  }

  const moveUp = (index: number) => {
    bankRatesStore.moveBankRateUp(index)
    saveOrder()
  }

  const moveDown = (index: number) => {
    bankRatesStore.moveBankRateDown(index)
    saveOrder()
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    bankRatesStore.loadBankRates()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Store
    bankRatesStore,

    // State
    showFormModal,
    editingBank,

    // Modal actions
    openAddModal,
    openEditModal,

    // CRUD operations
    handleSave,
    toggleActive,
    confirmDelete,

    // Reordering
    moveUp,
    moveDown,
  }
}
