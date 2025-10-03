<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { adminCustomerApi, type Customer, type CustomerStatistics } from '@/services/adminCustomerApi'
import { useToastStore } from '@/stores/ui/toast'
import { useAuthStore } from '@/stores/auth/auth'

const toastStore = useToastStore()
const authStore = useAuthStore()

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
})

const statusOptions = [
  { value: 'all', label: 'ყველა' },
  { value: 'new', label: 'ახალი' },
  { value: 'contacted', label: 'დაკავშირებული' },
  { value: 'in_progress', label: 'მიმდინარე' },
  { value: 'completed', label: 'დასრულებული' },
  { value: 'cancelled', label: 'გაუქმებული' },
]

const sourceOptions = [
  { value: 'all', label: 'ყველა' },
  { value: 'contact_form', label: 'კონტაქტის ფორმა' },
  { value: 'call_request', label: 'ზარის მოთხოვნა' },
]

const allSelected = computed({
  get: () => customers.value.length > 0 && selectedIds.value.length === customers.value.length,
  set: (value: boolean) => {
    selectedIds.value = value ? customers.value.map((c) => c.id) : []
  },
})

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

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getSourceBadgeClass = (source: string) => {
  return source === 'contact_form'
    ? 'bg-indigo-100 text-indigo-800'
    : 'bg-emerald-100 text-emerald-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    new: 'ახალი',
    contacted: 'დაკავშირებული',
    in_progress: 'მიმდინარე',
    completed: 'დასრულებული',
    cancelled: 'გაუქმებული',
  }
  return labels[status] || status
}

const getSourceLabel = (source: string) => {
  return source === 'contact_form' ? 'კონტაქტის ფორმა' : 'ზარის მოთხოვნა'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ka-GE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadCustomers()
  loadStatistics()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">კლიენტები</h1>
        <p class="text-sm text-slate-600 mt-1">მომხმარებლების მოთხოვნების მართვა</p>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-600">სულ კლიენტი</p>
            <p class="text-2xl font-bold text-slate-800 mt-1">{{ statistics.total }}</p>
          </div>
          <div class="bg-blue-100 p-3 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-600">ახალი</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ statistics.new }}</p>
          </div>
          <div class="bg-green-100 p-3 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-600">კონტაქტის ფორმა</p>
            <p class="text-2xl font-bold text-indigo-600 mt-1">{{ statistics.contact_form }}</p>
          </div>
          <div class="bg-indigo-100 p-3 rounded-lg">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-600">ზარის მოთხოვნა</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">{{ statistics.call_request }}</p>
          </div>
          <div class="bg-emerald-100 p-3 rounded-lg">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">ძიება</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="სახელი, ელ. ფოსტა, ტელეფონი..."
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
            @keyup.enter="applyFilters"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">სტატუსი</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 bg-white"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">წყარო</label>
          <select
            v-model="filters.source"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 bg-white"
          >
            <option v-for="option in sourceOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="flex space-x-2 col-span-2">
          <button
            @click="applyFilters"
            class="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            ძიება
          </button>
          <button
            @click="resetFilters"
            class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            გასუფთავება
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
      <!-- Bulk Actions -->
      <div v-if="selectedIds.length > 0 && authStore.isAdmin" class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-blue-900">
            არჩეულია {{ selectedIds.length }} კლიენტი
          </span>
        </div>
        <div class="mt-3 flex space-x-3">
          <select
            @change="
              (e) => {
                const target = e.target as HTMLSelectElement
                if (target.value) {
                  bulkUpdateStatus(target.value)
                  target.value = ''
                }
              }
            "
            class="px-3 py-1.5 text-sm border border-blue-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">სტატუსის შეცვლა</option>
            <option value="contacted">დაკავშირებული</option>
            <option value="in_progress">მიმდინარე</option>
            <option value="completed">დასრულებული</option>
            <option value="cancelled">გაუქმებული</option>
          </select>
          <button
            @click="bulkDelete"
            class="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            წაშლა
          </button>
        </div>
      </div>    <!-- Table -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th v-if="authStore.isAdmin" class="px-4 py-3 text-left">
                <input
                  v-model="allSelected"
                  type="checkbox"
                  class="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">სახელი</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">კონტაქტი</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">წყარო</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">სტატუსი</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">თარიღი</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">მოქმედებები</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading">
              <td :colspan="authStore.isAdmin ? 7 : 6" class="px-6 py-12 text-center text-slate-500">იტვირთება...</td>
            </tr>
            <tr v-else-if="customers.length === 0">
              <td :colspan="authStore.isAdmin ? 7 : 6" class="px-6 py-12 text-center text-slate-500">კლიენტები არ მოიძებნა</td>
            </tr>
            <tr
              v-for="customer in customers"
              :key="customer.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td v-if="authStore.isAdmin" class="px-4 py-4">
                <input
                  v-model="selectedIds"
                  :value="customer.id"
                  type="checkbox"
                  class="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-slate-900">{{ customer.name }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-slate-900">{{ customer.email }}</div>
                <div class="text-sm text-slate-500">{{ customer.phone }}</div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getSourceBadgeClass(customer.source)"
                >
                  {{ getSourceLabel(customer.source) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <select
                  :value="customer.status"
                  @change="(e) => updateCustomerStatus(customer.id, (e.target as HTMLSelectElement).value)"
                  class="px-2 py-1 text-xs font-semibold rounded-full border-0"
                  :class="getStatusBadgeClass(customer.status)"
                >
                  <option value="new">ახალი</option>
                  <option value="contacted">დაკავშირებული</option>
                  <option value="in_progress">მიმდინარე</option>
                  <option value="completed">დასრულებული</option>
                  <option value="cancelled">გაუქმებული</option>
                </select>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ formatDate(customer.created_at) }}
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="viewDetails(customer)"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                  title="დეტალები"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  v-if="authStore.isAdmin"
                  @click="deleteCustomer(customer.id)"
                  class="text-red-600 hover:text-red-800 transition-colors"
                  title="წაშლა"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-700 font-medium">
            ნაჩვენებია {{ pagination.from }}-{{ pagination.to }} სულ {{ pagination.total }}-დან
          </div>
          <div class="flex space-x-2">
            <button
              :disabled="pagination.current_page === 1"
              @click="changePage(pagination.current_page - 1)"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              წინა
            </button>
            <button
              :disabled="pagination.current_page === pagination.last_page"
              @click="changePage(pagination.current_page + 1)"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              შემდეგი
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Details Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDetailsModal && selectedCustomer"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click="closeDetailsModal"
        >
          <div
            class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-slate-800">კლიენტის დეტალები</h3>
              <button
                @click="closeDetailsModal"
                class="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">სახელი</label>
                <p class="text-slate-900">{{ selectedCustomer.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">ელ. ფოსტა</label>
                <a :href="`mailto:${selectedCustomer.email}`" class="text-blue-600 hover:text-blue-800">
                  {{ selectedCustomer.email }}
                </a>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">ტელეფონი</label>
                <a :href="`tel:${selectedCustomer.phone}`" class="text-blue-600 hover:text-blue-800">
                  {{ selectedCustomer.phone }}
                </a>
              </div>

              <div v-if="selectedCustomer.subject">
                <label class="block text-sm font-medium text-slate-700 mb-1">თემა</label>
                <p class="text-slate-900">{{ selectedCustomer.subject }}</p>
              </div>

              <div v-if="selectedCustomer.message">
                <label class="block text-sm font-medium text-slate-700 mb-1">შეტყობინება</label>
                <p class="text-slate-900 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                  {{ selectedCustomer.message }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">წყარო</label>
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getSourceBadgeClass(selectedCustomer.source)"
                  >
                    {{ getSourceLabel(selectedCustomer.source) }}
                  </span>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">სტატუსი</label>
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStatusBadgeClass(selectedCustomer.status)"
                  >
                    {{ getStatusLabel(selectedCustomer.status) }}
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">შექმნის თარიღი</label>
                <p class="text-slate-900">{{ formatDate(selectedCustomer.created_at) }}</p>
              </div>

              <!-- Notes Section -->
              <div class="border-t border-slate-200 pt-4">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-slate-700">შენიშვნები</label>
                  <button
                    v-if="!editingNotes"
                    @click="editingNotes = true"
                    class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {{ selectedCustomer.notes ? 'რედაქტირება' : 'დამატება' }}
                  </button>
                </div>
                
                <div v-if="editingNotes">
                  <textarea
                    v-model="notesInput"
                    rows="4"
                    placeholder="დაწერეთ შენიშვნები..."
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 resize-none"
                  ></textarea>
                  <div class="flex justify-end space-x-2 mt-2">
                    <button
                      @click="editingNotes = false; notesInput = selectedCustomer.notes || ''"
                      class="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      გაუქმება
                    </button>
                    <button
                      @click="saveNotes"
                      class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      შენახვა
                    </button>
                  </div>
                </div>
                
                <div v-else>
                  <p
                    v-if="selectedCustomer.notes"
                    class="text-slate-900 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg"
                  >
                    {{ selectedCustomer.notes }}
                  </p>
                  <p v-else class="text-slate-500 italic">შენიშვნები არ არის დამატებული</p>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button
                @click="closeDetailsModal"
                class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                დახურვა
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>
