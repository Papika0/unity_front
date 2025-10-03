<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">მთავარი პანელი</h1>
        <p class="mt-1 text-sm text-gray-600">
          მართეთ თქვენი პროექტები, თარგმანები და კლიენტები
        </p>
      </div>
      <button
        @click="clearCache"
        :disabled="clearingCache"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="!clearingCache" class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ clearingCache ? 'იწმინდება...' : 'კეშის გასუფთავება' }}
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Customers -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">სულ კლიენტები</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ loading ? '...' : stats.customer_stats.total }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <router-link to="/admin/customers" class="font-medium text-blue-600 hover:text-blue-500">
              ყველას ნახვა
            </router-link>
          </div>
        </div>
      </div>

      <!-- New Customers -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">ახალი კლიენტები</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ loading ? '...' : stats.customer_stats.new }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <span class="font-medium text-green-600">დღეს: {{ loading ? '...' : stats.customer_stats.today }}</span>
          </div>
        </div>
      </div>

      <!-- Projects Stats -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">სულ პროექტები</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ loading ? '...' : stats.projects_count }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <router-link to="/admin/projects" class="font-medium text-indigo-600 hover:text-indigo-500">
              პროექტების მართვა
            </router-link>
          </div>
        </div>
      </div>

      <!-- Translations Stats -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">სულ თარგმანები</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ loading ? '...' : stats.translations_count }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <router-link to="/admin/translations" class="font-medium text-purple-600 hover:text-purple-500">
              თარგმანების მართვა
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Activity Chart -->
    <div class="mt-8 bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">კლიენტების აქტივობა (ბოლო 30 დღე)</h2>
      </div>
      <div class="p-6">
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-gray-400">იტვირთება...</div>
        </div>
        <div v-else-if="!stats.chart_data || stats.chart_data.length === 0" class="flex items-center justify-center h-64">
          <div class="text-gray-400">მონაცემები არ არის</div>
        </div>
        <div v-else class="h-64">
          <canvas ref="chartCanvas" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">სწრაფი მოქმედებები</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Customers -->
        <div class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div>
            <span class="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <div class="mt-8">
            <h3 class="text-lg font-medium">
              <router-link to="/admin/customers" class="focus:outline-none">
                <span class="absolute inset-0" aria-hidden="true"></span>
                კლიენტების მართვა
              </router-link>
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              იხილეთ და მართეთ მიღებული მოთხოვნები
            </p>
          </div>
        </div>

        <!-- Add New Project -->
        <div class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div>
            <span class="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-600 ring-4 ring-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
          </div>
          <div class="mt-8">
            <h3 class="text-lg font-medium">
              <router-link to="/admin/projects" class="focus:outline-none">
                <span class="absolute inset-0" aria-hidden="true"></span>
                ახალი პროექტი
              </router-link>
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              შექმენით და მართეთ პროექტები
            </p>
          </div>
        </div>

        <!-- Manage Translations -->
        <div class="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div>
            <span class="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
          </div>
          <div class="mt-8">
            <h3 class="text-lg font-medium">
              <router-link to="/admin/translations" class="focus:outline-none">
                <span class="absolute inset-0" aria-hidden="true"></span>
                თარგმანების მართვა
              </router-link>
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              დაამატეთ და ორგანიზება გაუწიეთ თარგმანებს
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm transition-opacity duration-300"
      :class="{ 'opacity-0': !showToast }"
    >
      <div class="flex items-center">
        <svg class="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-sm font-medium text-green-900">{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { dashboardApi, type DashboardStatistics } from '@/services/dashboardApi'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
)

const stats = ref<DashboardStatistics>({
  customer_stats: {
    total: 0,
    new: 0,
    in_progress: 0,
    completed: 0,
    contact_form: 0,
    call_request: 0,
    today: 0,
    this_week: 0,
    this_month: 0,
  },
  projects_count: 0,
  translations_count: 0,
  chart_data: [],
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const loading = ref(true)
const clearingCache = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const loadStats = async () => {
  try {
    loading.value = true
    console.log('🔄 Loading dashboard statistics...')
    
    // Single API call to get all dashboard data
    stats.value = await dashboardApi.getStatistics()
    
    console.log('✅ Statistics loaded:', {
      customers: stats.value.customer_stats.total,
      projects: stats.value.projects_count,
      translations: stats.value.translations_count,
      chartDataPoints: stats.value.chart_data.length,
    })

    // Set loading to false first to render the canvas
    loading.value = false
    
    // Wait for DOM to update and render chart
    await nextTick()
    await nextTick() // Double nextTick to ensure DOM is fully rendered
    console.log('⏳ Rendering chart after nextTick...')
    renderChart()
  } catch (error) {
    console.error('❌ Error loading stats:', error)
    loading.value = false
  }
}

// Watch for chart data changes and re-render
watch(() => stats.value.chart_data, (newData) => {
  if (newData && newData.length > 0 && chartCanvas.value) {
    console.log('📊 Chart data changed, re-rendering...', newData.length, 'points')
    nextTick(() => renderChart())
  }
}, { deep: true })

const renderChart = () => {
  console.log('renderChart called:', {
    hasCanvas: !!chartCanvas.value,
    canvasElement: chartCanvas.value,
    dataLength: stats.value.chart_data?.length || 0,
  })

  if (!chartCanvas.value) {
    console.error('❌ Canvas element not found - retrying in 100ms...')
    // Retry after a short delay
    setTimeout(() => {
      console.log('🔄 Retrying chart render...')
      if (chartCanvas.value) {
        renderChart()
      } else {
        console.error('❌ Canvas still not found after retry')
      }
    }, 100)
    return
  }

  if (!stats.value.chart_data || stats.value.chart_data.length === 0) {
    console.warn('⚠️ No chart data available')
    return
  }

  // Destroy existing chart if any
  if (chartInstance.value) {
    console.log('🗑️ Destroying existing chart instance')
    chartInstance.value.destroy()
    chartInstance.value = null
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) {
    console.error('❌ Cannot get canvas 2D context')
    return
  }

  try {
    console.log('🎨 Creating new chart with', stats.value.chart_data.length, 'data points')
    
    chartInstance.value = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stats.value.chart_data.map((d) => {
          const date = new Date(d.date)
          return `${date.getMonth() + 1}/${date.getDate()}`
        }),
        datasets: [
          {
            label: 'კლიენტები',
            data: stats.value.chart_data.map((d) => d.count),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `კლიენტები: ${context.parsed.y}`
              }
            }
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    })
    console.log('✅ Chart rendered successfully!', chartInstance.value)
  } catch (error) {
    console.error('❌ Error rendering chart:', error)
  }
}

const clearCache = async () => {
  try {
    clearingCache.value = true
    const result = await dashboardApi.clearCache()
    toastMessage.value = result.message
    showToast.value = true

    // Hide toast after 3 seconds
    setTimeout(() => {
      showToast.value = false
    }, 3000)

    // Reload stats after clearing cache
    await loadStats()
  } catch (error) {
    console.error('Error clearing cache:', error)
    toastMessage.value = 'კეშის გასუფთავება ვერ მოხერხდა'
    showToast.value = true

    setTimeout(() => {
      showToast.value = false
    }, 3000)
  } finally {
    clearingCache.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>
