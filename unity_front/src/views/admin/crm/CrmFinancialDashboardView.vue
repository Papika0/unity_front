<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ t('admin.crm.financial.title') }}</h1>
        <p class="mt-1 text-xs sm:text-sm text-gray-600">
          {{ t('admin.crm.financial.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="mb-8 bg-gradient-to-r from-white to-gray-50 shadow-sm border border-gray-200 rounded-2xl p-6 transition-all hover:shadow-md">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- User Filter -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            {{ t('admin.crm.financial.filter_user') }}
          </label>
          <select
            v-model="filters.userId"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm transition-all"
          >
            <option :value="null">{{ t('admin.crm.financial.all_users') }}</option>
          </select>
        </div>

        <!-- Date From -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            {{ t('admin.crm.financial.date_from') }}
          </label>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm transition-all"
          />
        </div>

        <!-- Date To -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            {{ t('admin.crm.financial.date_to') }}
          </label>
          <input
            v-model="filters.dateTo"
            type="date"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm transition-all"
          />
        </div>

        <!-- Filter Buttons -->
        <div class="flex items-end gap-2">
          <button
            @click="applyFilters"
            :disabled="loading"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {{ t('admin.crm.financial.apply_filters') }}
          </button>
          <button
            @click="resetFilters"
            :disabled="loading"
            class="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ t('admin.crm.financial.reset_filters') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 mb-6">
        <!-- Total Sold Value -->
        <StatCard
          :title="t('admin.crm.financial.total_sold_value')"
          :value="formatCurrency(metrics.total_sold_value)"
          icon="dollar-sign"
          color="blue"
        />

        <!-- Total Paid -->
        <StatCard
          :title="t('admin.crm.financial.total_paid')"
          :value="formatCurrency(metrics.total_paid)"
          icon="check-circle"
          color="green"
        />

        <!-- Total Outstanding -->
        <StatCard
          :title="t('admin.crm.financial.total_outstanding')"
          :value="formatCurrency(metrics.total_outstanding)"
          icon="alert-circle"
          color="orange"
        />

        <!-- Payment Collection Rate -->
        <StatCard
          :title="t('admin.crm.financial.collection_rate')"
          :value="`${metrics.payment_collection_rate}%`"
          icon="trending-up"
          color="purple"
        />

        <!-- Apartments Available -->
        <StatCard
          :title="t('admin.crm.financial.apartments_available')"
          :value="metrics.apartments_available"
          icon="home"
          color="emerald"
        />

        <!-- Apartments Reserved -->
        <StatCard
          :title="t('admin.crm.financial.apartments_reserved')"
          :value="metrics.apartments_reserved"
          icon="lock"
          color="amber"
        />

        <!-- Apartments Sold -->
        <StatCard
          :title="t('admin.crm.financial.apartments_sold')"
          :value="metrics.apartments_sold"
          icon="check"
          color="indigo"
        />

        <!-- Overdue Payments -->
        <StatCard
          :title="t('admin.crm.financial.overdue_payments')"
          :value="`${metrics.overdue_payments_count} (${formatCurrency(metrics.overdue_payments_value)})`"
          icon="alert-triangle"
          color="red"
        />
      </div>

      <!-- Upcoming Payments Table -->
      <div class="bg-white shadow rounded-2xl overflow-hidden border border-gray-100">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ t('admin.crm.financial.upcoming_payments') }}
          </h2>
          <span class="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full cursor-default">
            {{ upcomingPayments.length }} {{ t('admin.crm.financial.items') }}
          </span>
        </div>

        <!-- Sum Banner -->
        <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">
                {{ t('admin.crm.financial.total_upcoming') }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ t('admin.crm.financial.next_30_days') }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-blue-900">
                {{ formatCurrency(upcomingPaymentsTotal) }}
              </p>
              <p class="text-xs text-blue-600 mt-0.5">
                {{ upcomingPayments.length }} {{ t('admin.crm.financial.payments') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="upcomingPayments.length === 0" class="px-6 py-12 text-center">
          <p class="text-gray-500">{{ t('admin.crm.financial.no_upcoming_payments') }}</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {{ t('admin.crm.financial.customer') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {{ t('admin.crm.financial.apartment') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {{ t('admin.crm.financial.amount') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {{ t('admin.crm.financial.due_date') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {{ t('admin.crm.financial.status') }}
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {{ t('admin.crm.financial.days_until_due') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr
                v-for="(payment, index) in upcomingPayments"
                :key="payment.id"
                @click="navigateToDeal(payment.deal_id)"
                class="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                :class="{
                  'bg-red-50 hover:bg-red-100': payment.is_overdue,
                  'bg-gray-50': !payment.is_overdue && index % 2 === 1
                }"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <span class="text-sm font-semibold text-blue-700">
                        {{ payment.customer_name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ payment.customer_name }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900">{{ payment.project_title }}</span>
                    <span class="text-xs text-gray-500">{{ payment.apartment_number }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-gray-900">
                    {{ getCurrencySymbol(payment.currency) }}{{ formatNumber(payment.remaining_amount) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600">{{ formatDate(payment.due_date) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-3 py-1 text-xs font-semibold rounded-full"
                    :class="getStatusBadgeClass(payment.status)"
                  >
                    {{ getStatusLabel(payment.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="text-sm font-medium"
                          :class="payment.is_overdue ? 'text-red-600' : 'text-gray-600'">
                      {{ payment.days_until_due }} {{ t('admin.crm.financial.days') }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import { crmApi } from '@/services/crmApi'
import StatCard from './components/StatCard.vue'
import type { FinancialDashboardMetrics, UpcomingPayment } from '@/types/crm'

const { t } = useTranslations()
const { formatNumber, formatDate, getCurrencySymbol } = useLocaleFormatter()
const router = useRouter()

// State
const loading = ref(true)
const metrics = ref<FinancialDashboardMetrics>({
  total_sold_value: 0,
  total_paid: 0,
  total_outstanding: 0,
  apartments_available: 0,
  apartments_reserved: 0,
  apartments_sold: 0,
  overdue_payments_count: 0,
  overdue_payments_value: 0,
  payment_collection_rate: 0,
})
const upcomingPayments = ref<UpcomingPayment[]>([])

// Computed sum of upcoming payments
const upcomingPaymentsTotal = computed(() => {
  return upcomingPayments.value.reduce((sum, payment) => {
    return sum + (payment.remaining_amount || 0)
  }, 0)
})

const filters = ref({
  projectIds: [],
  userId: null as number | null,
  dateFrom: null as string | null,
  dateTo: null as string | null,
})

// Initialize dates
function initDates() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)
  
  filters.value.dateFrom = start.toISOString().split('T')[0]
  filters.value.dateTo = end.toISOString().split('T')[0]
}

// Methods
async function loadDashboard() {
  loading.value = true
  try {
    const response = await crmApi.getFinancialDashboard(filters.value)
    metrics.value = response.metrics
    upcomingPayments.value = response.upcoming_payments
  } catch (error) {
    console.error('Failed to load financial dashboard:', error)
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadDashboard()
}

function resetFilters() {
  filters.value = {
    projectIds: [],
    userId: null,
    dateFrom: null,
    dateTo: null,
  }
  loadDashboard()
}

function navigateToDeal(dealId: number) {
  // Navigate to CRM pipeline with deal selected
  router.push({ name: 'admin-crm-pipeline', query: { deal: dealId.toString() } })
}

function formatCurrency(value: number): string {
  return `$${formatNumber(value, { maximumFractionDigits: 0 })}`
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    partially_paid: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    paid: t('admin.crm.financial.status_paid'),
    pending: t('admin.crm.financial.status_pending'),
    overdue: t('admin.crm.financial.status_overdue'),
    partially_paid: t('admin.crm.financial.status_partially_paid'),
    cancelled: t('admin.crm.financial.status_cancelled'),
  }
  return labels[status] || status
}

onMounted(() => {
  initDates()
  loadDashboard()
})
</script>
