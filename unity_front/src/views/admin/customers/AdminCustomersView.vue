<template>
  <div class="p-6 space-y-6">
    <CustomersHeader />

    <CustomersStatistics :statistics="statistics" />

    <CustomersFilters
      v-model="filters"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <CustomersTable
      :customers="customers"
      :loading="loading"
      :pagination="pagination"
      v-model:selectedIds="selectedIds"
      :all-selected="allSelected"
      :is-admin="!!authStore.isAdmin"
      @update:selectedIds="selectedIds = $event"
      @toggle-all="allSelected = $event"
      @view-details="viewDetails"
      @delete="deleteCustomer"
      @update-status="updateCustomerStatus"
      @bulk-update-status="bulkUpdateStatus"
      @bulk-delete="bulkDelete"
      @bulk-create-leads="bulkCreateLeads"
      @change-page="changePage"
    />

    <CustomerDetailsModal
      :show="showDetailsModal"
      :customer="selectedCustomer"
      v-model:editingNotes="editingNotes"
      v-model:notesInput="notesInput"
      @close="closeDetailsModal"
      @save-notes="saveNotes"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth/auth'
import { useAdminCustomers } from './composables/useAdminCustomers'

// Components
import CustomersHeader from './components/table/CustomersHeader.vue'
import CustomersStatistics from './components/table/CustomersStatistics.vue'
import CustomersFilters from './components/table/CustomersFilters.vue'
import CustomersTable from './components/table/CustomersTable.vue'
import CustomerDetailsModal from './components/modals/CustomerDetailsModal.vue'

const authStore = useAuthStore()

const {
  customers,
  statistics,
  loading,
  selectedCustomer,
  showDetailsModal,
  selectedIds,
  editingNotes,
  notesInput,
  filters,
  pagination,
  allSelected,
  loadCustomers,
  loadStatistics,
  viewDetails,
  closeDetailsModal,
  saveNotes,
  updateCustomerStatus,
  deleteCustomer,
  bulkUpdateStatus,
  bulkDelete,
  bulkCreateLeads,
  applyFilters,
  resetFilters,
  changePage
} = useAdminCustomers()

onMounted(() => {
  loadCustomers()
  loadStatistics()
})
</script>
