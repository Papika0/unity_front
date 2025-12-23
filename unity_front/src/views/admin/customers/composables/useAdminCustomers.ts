import { ref, computed } from 'vue'
import { adminCustomerApi, type Customer, type CustomerStatistics } from '@/services/adminCustomerApi'
import { useToastStore } from '@/stores/ui/toast'

export function useAdminCustomers() {
  const toastStore = useToastStore()

  // State
  const customers = ref<Customer[]>([])
  const statistics = ref<CustomerStatistics>({
    total: 0,
    new: 0,
    in_progress: 0,
    completed: 0,
    contact_form: 0,
    call_request: 0,
    today: 0,
    this_week: 0,
    this_month: 0,
  })
  const loading = ref(false)
  const selectedCustomer = ref<Customer | null>(null)
  const showDetailsModal = ref(false)
  const selectedIds = ref<number[]>([])
  const editingNotes = ref(false)
  const notesInput = ref('')

  // Filters
  const filters = ref({
    status: 'all',
    source: 'all',
    search: '',
    date_from: '',
    date_to: '',
    per_page: 15,
    page: 1,
  })

  // Pagination
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  })

  // Computed
  const allSelected = computed({
    get: () => customers.value.length > 0 && selectedIds.value.length === customers.value.length,
    set: (value: boolean) => {
      selectedIds.value = value ? customers.value.map((c) => c.id) : []
    },
  })

  // Actions
  const loadCustomers = async () => {
    loading.value = true
    try {
      const response = await adminCustomerApi.getAll(filters.value)
      customers.value = response.data
      pagination.value = response.meta
    } catch (error) {
      console.error('Failed to load customers:', error)
      toastStore.error('შეცდომა', 'კლიენტების ჩატვირთვა ვერ მოხერხდა')
    } finally {
      loading.value = false
    }
  }

  const loadStatistics = async () => {
    try {
      statistics.value = await adminCustomerApi.getStatistics()
    } catch (error) {
      console.error('Failed to load statistics:', error)
    }
  }

  const viewDetails = (customer: Customer) => {
    selectedCustomer.value = customer
    notesInput.value = customer.notes || ''
    editingNotes.value = false
    showDetailsModal.value = true
  }

  const closeDetailsModal = () => {
    showDetailsModal.value = false
    selectedCustomer.value = null
    editingNotes.value = false
    notesInput.value = ''
  }

  const saveNotes = async () => {
    if (!selectedCustomer.value) return

    try {
      await adminCustomerApi.update(selectedCustomer.value.id, {
        notes: notesInput.value,
      })
      toastStore.success('წარმატება', 'შენიშვნები შენახულია')
      selectedCustomer.value.notes = notesInput.value
      editingNotes.value = false
      await loadCustomers()
    } catch (error) {
      console.error('Failed to save notes:', error)
      toastStore.error('შეცდომა', 'შენიშვნების შენახვა ვერ მოხერხდა')
    }
  }

  const updateCustomerStatus = async (id: number, status: string) => {
    try {
      await adminCustomerApi.update(id, { status })
      toastStore.success('წარმატება', 'სტატუსი განახლდა')
      await loadCustomers()
      await loadStatistics()
    } catch (error) {
      console.error('Failed to update status:', error)
      toastStore.error('შეცდომა', 'სტატუსის განახლება ვერ მოხერხდა')
    }
  }

  const deleteCustomer = async (id: number) => {
    if (!confirm('დარწმუნებული ხართ, რომ გსურთ ამ კლიენტის წაშლა?')) return

    try {
      await adminCustomerApi.delete(id)
      toastStore.success('წარმატება', 'კლიენტი წაიშალა')
      if (customers.value.length === 1 && pagination.value.current_page > 1) {
         filters.value.page--
      }
      await loadCustomers()
      await loadStatistics()
    } catch (error) {
      console.error('Failed to delete customer:', error)
      toastStore.error('შეცდომა', 'კლიენტის წაშლა ვერ მოხერხდა')
    }
  }

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.value.length === 0) {
      toastStore.warning('გაფრთხილება', 'გთხოვთ აირჩიოთ კლიენტები')
      return
    }

    try {
      await adminCustomerApi.bulkUpdateStatus(selectedIds.value, status)
      toastStore.success('წარმატება', 'სტატუსი განახლდა')
      selectedIds.value = []
      await loadCustomers()
      await loadStatistics()
    } catch (error) {
      console.error('Failed to bulk update:', error)
      toastStore.error('შეცდომა', 'სტატუსის განახლება ვერ მოხერხდა')
    }
  }

  const bulkDelete = async () => {
    if (selectedIds.value.length === 0) {
      toastStore.warning('გაფრთხილება', 'გთხოვთ აირჩიოთ კლიენტები')
      return
    }

    if (!confirm(`დარწმუნებული ხართ, რომ გსურთ ${selectedIds.value.length} კლიენტის წაშლა?`)) return

    try {
      await adminCustomerApi.bulkDelete(selectedIds.value)
      toastStore.success('წარმატება', 'კლიენტები წაიშალა')
      selectedIds.value = []
      await loadCustomers()
      await loadStatistics()
    } catch (error) {
      console.error('Failed to bulk delete:', error)
      toastStore.error('შეცდომა', 'კლიენტების წაშლა ვერ მოხერხდა')
    }
  }

  const applyFilters = () => {
    filters.value.page = 1
    loadCustomers()
  }

  const resetFilters = () => {
    filters.value = {
      status: 'all',
      source: 'all',
      search: '',
      date_from: '',
      date_to: '',
      per_page: 15,
      page: 1,
    }
    loadCustomers()
  }

  const changePage = (page: number) => {
    filters.value.page = page
    loadCustomers()
  }

  return {
    // State
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
    
    // Computed
    allSelected,
    
    // Actions
    loadCustomers,
    loadStatistics,
    viewDetails,
    closeDetailsModal,
    saveNotes,
    updateCustomerStatus,
    deleteCustomer,
    bulkUpdateStatus,
    bulkDelete,
    applyFilters,
    resetFilters,
    changePage
  }
}
