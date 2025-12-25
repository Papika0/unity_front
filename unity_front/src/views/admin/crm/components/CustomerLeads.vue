<script setup lang="ts">
/**
 * Customer Leads Component
 * Shows customer requests/leads that can be converted to deals
 */

import { ref, onMounted } from 'vue'
import { adminCustomerApi, type Customer, type CustomerStatistics } from '@/services/adminCustomerApi'
import { useToastStore } from '@/stores/ui/toast'
import { useCrmStore } from '@/stores/admin/crm'

const toast = useToastStore()
const crmStore = useCrmStore()

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
const showCreateDealModal = ref(false)
const editingNotes = ref(false)
const notesInput = ref('')

// Deal form
const newDealValue = ref(0)
const newDealCurrency = ref<'USD' | 'GEL' | 'EUR'>('USD')

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

// Load data
onMounted(async () => {
  await Promise.all([loadCustomers(), loadStatistics()])
})

async function loadCustomers(): Promise<void> {
  loading.value = true
  try {
    const response = await adminCustomerApi.getAll(filters.value)
    customers.value = response.data
    pagination.value = response.meta
  } catch (error) {
    console.error('Failed to load customers:', error)
    toast.error('კლიენტების ჩატვირთვა ვერ მოხერხდა')
  } finally {
    loading.value = false
  }
}

async function loadStatistics(): Promise<void> {
  try {
    statistics.value = await adminCustomerApi.getStatistics()
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
}

// View details
function viewDetails(customer: Customer): void {
  selectedCustomer.value = customer
  notesInput.value = customer.notes || ''
  editingNotes.value = false
  showDetailsModal.value = true
}

// Create deal from customer
function initiateCreateDeal(customer: Customer): void {
  selectedCustomer.value = customer
  showCreateDealModal.value = true
}

async function handleCreateDeal(): Promise<void> {
  if (!selectedCustomer.value) return

  try {
    await crmStore.createDeal({
      customer_id: selectedCustomer.value.id,
      title: `${selectedCustomer.value.name} - ახალი გარიგება`,
      value: newDealValue.value,
      currency: newDealCurrency.value,
    })

    toast.success('გარიგება შეიქმნა')
    showCreateDealModal.value = false
    newDealValue.value = 0
    newDealCurrency.value = 'USD'

    // Update customer status
    await updateCustomerStatus(selectedCustomer.value.id, 'in_progress')
  } catch {
    toast.error('გარიგების შექმნა ვერ მოხერხდა')
  }
}

// Update status
async function updateCustomerStatus(id: number, status: string): Promise<void> {
  try {
    await adminCustomerApi.update(id, { status })
    toast.success('სტატუსი განახლდა')
    await loadCustomers()
    await loadStatistics()
  } catch (error) {
    console.error('Failed to update status:', error)
    toast.error('სტატუსის განახლება ვერ მოხერხდა')
  }
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get status badge class
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'contacted':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'in_progress':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'cancelled':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// Get source label
function getSourceLabel(source: string): string {
  return source === 'contact_form' ? 'კონტაქტის ფორმა' : 'ზარის მოთხოვნა'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Statistics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="text-2xl font-bold text-gray-900">{{ statistics.total }}</div>
        <div class="text-sm text-gray-500">სულ კლიენტები</div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="text-2xl font-bold text-blue-600">{{ statistics.new }}</div>
        <div class="text-sm text-gray-500">ახალი</div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="text-2xl font-bold text-purple-600">{{ statistics.in_progress }}</div>
        <div class="text-sm text-gray-500">მიმდინარე</div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="text-2xl font-bold text-green-600">{{ statistics.completed }}</div>
        <div class="text-sm text-gray-500">დასრულებული</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">სტატუსი</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            @change="loadCustomers"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value" class="text-gray-900">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">წყარო</label>
          <select
            v-model="filters.source"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            @change="loadCustomers"
          >
            <option v-for="opt in sourceOptions" :key="opt.value" :value="opt.value" class="text-gray-900">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ძიება</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="სახელი, ტელეფონი, email..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="loadCustomers"
          />
        </div>

        <div class="flex items-end">
          <button
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            @click="loadCustomers"
          >
            ძიება
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
      <p class="mt-4 text-gray-500">იტვირთება...</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">სახელი</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">კონტაქტი</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">წყარო</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">სტატუსი</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">თარიღი</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">მოქმედებები</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ customer.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ customer.email || '-' }}</div>
                <div class="text-sm text-gray-500">{{ customer.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-700">{{ getSourceLabel(customer.source) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-medium rounded border"
                  :class="getStatusBadgeClass(customer.status)"
                >
                  {{ statusOptions.find((s) => s.value === customer.status)?.label }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(customer.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  class="text-blue-600 hover:text-blue-900"
                  @click="initiateCreateDeal(customer)"
                >
                  გარიგების შექმნა
                </button>
                <button
                  class="text-gray-600 hover:text-gray-900"
                  @click="viewDetails(customer)"
                >
                  დეტალები
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="customers.length === 0" class="text-center py-12">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p class="text-gray-500">კლიენტები არ მოიძებნა</p>
      </div>
    </div>

    <!-- Create Deal Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateDealModal && selectedCustomer"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="showCreateDealModal = false"></div>

        <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">გარიგების შექმნა</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">კლიენტი</label>
              <input
                type="text"
                :value="selectedCustomer.name"
                disabled
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ღირებულება</label>
              <input
                v-model.number="newDealValue"
                type="number"
                min="0"
                step="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ვალუტა</label>
              <select
                v-model="newDealCurrency"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="USD" class="text-gray-900">USD ($)</option>
                <option value="GEL" class="text-gray-900">GEL (₾)</option>
                <option value="EUR" class="text-gray-900">EUR (€)</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              @click="showCreateDealModal = false"
            >
              გაუქმება
            </button>
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              @click="handleCreateDeal"
            >
              შექმნა
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
