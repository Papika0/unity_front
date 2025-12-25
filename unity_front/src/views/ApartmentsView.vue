<script setup lang="ts">
import { ref, onMounted, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleStore } from '@/stores/ui/locale'
import { useTranslationLoader } from '@/composables/i18n/useTranslationLoader'
import { apartmentService } from '@/services/apartmentService'
import type { ApartmentFilters, ApartmentSearchResult } from '@/services/apartmentService'
import type { ApartmentDetail } from '@/types/apartments'
import ApartmentFilter from '@/components/apartments/ApartmentFilter.vue'
import ApartmentCard from '@/components/apartments/ApartmentCard.vue'

const { t } = useTranslations()
const router = useRouter()
const { loadPageTranslations } = useTranslationLoader()
const localeStore = useLocaleStore()

defineOptions({
  name: 'ApartmentsView'
})

const loading = ref(false)
const apartments = ref<ApartmentSearchResult[]>([])
const totalApartments = ref(0)
const currentPage = ref(1)
const lastPage = ref(1)

const filters = ref<ApartmentFilters & { bedrooms: number[]; min_area: number | null; max_area: number | null }>({
  project_id: null,
  bedrooms: [],
  min_area: null,
  max_area: null,
  min_price: null,
  max_price: null,
  page: 1
})

// Scroll to top function
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const fetchApartments = async (resetPage = true) => {
  try {
    loading.value = true
    
    if (resetPage) {
      currentPage.value = 1
      filters.value.page = 1
    } else {
      filters.value.page = currentPage.value
    }

    const response = await apartmentService.search(filters.value)
    
    apartments.value = response.data
    currentPage.value = response.current_page
    lastPage.value = response.last_page
    totalApartments.value = response.total
    
    if (resetPage) {
      scrollToTop()
    }
  } catch (error) {
    console.error('Failed to fetch apartments:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= lastPage.value) {
    currentPage.value = page
    fetchApartments(false)
    scrollToTop()
  }
}

// Map search result to ApartmentDetail for the card
const mapToDetail = (apt: ApartmentSearchResult): ApartmentDetail => {
  return {
    ...apt,
    project: {
      id: apt.project_id,
      title: apt.project_title,
      location: '' // Not essential for card
    },
    building: {
      id: apt.building_id,
      name: apt.building_name,
      identifier: apt.building_identifier // Now available
    },
    // Ensure compatibility
    has_parking: false, 
    floor_plan_image: undefined,
  } as ApartmentDetail
}

const navigateToApartment = (apt: ApartmentSearchResult) => {
  // Navigate to Global Apartment Detail (Standalone/Fullscreen)
  router.push({
    name: 'apartment-detail-global',
    params: {
      id: apt.id.toString()
    }
  })
}

onMounted(() => {
  // Load translations for this page
  loadPageTranslations('apartments')

  if (apartments.value.length === 0) {
    fetchApartments()
  }
})

// Watch for locale changes to reload translations
watch(
  () => localeStore.currentLocale,
  () => {
    loadPageTranslations('apartments')
  }
)

// Optional: refresh if needed when returning
onActivated(() => {
  // We keep the state, so no need to refetch unless we think data is stale.
  // Prior behavior was refetch on mount. KeepAlive skips mount.
  // If we want to preserve scroll position, the browser usually handles it, 
  // but let's just ensure we DON'T reset filters.
})
</script>

<template>
  <div class="apartments-view bg-white min-h-screen pt-24 lg:pt-32 pb-20">
    
    <div class="max-w-[1920px] mx-auto px-6 lg:px-10 xl:px-32">
      
      <!-- Page Header -->
      <div class="mb-12">
        <h1 class="text-3xl lg:text-4xl font-light text-zinc-900 mb-4">
          {{ t('apartments.find_your_home') || 'Find Your Perfect Home' }}
        </h1>
        <p class="text-zinc-500 font-light max-w-2xl">
          {{ t('apartments.search_description') || 'Browse our available apartments across all projects using the filters below.' }}
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-12">
        <ApartmentFilter 
          v-model="filters as any" 
          :loading="loading"
          @search="fetchApartments(true)" 
        />
      </div>

      <!-- Results Grid -->
      <div v-if="loading && apartments.length === 0" class="py-20 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"></div>
        <p class="text-lg text-[#FFCD4B] font-light uppercase tracking-wider">{{ t('common.loading') }}</p>
      </div>

      <div v-else-if="apartments.length === 0" class="py-20 text-center bg-zinc-50 rounded-2xl">
        <div class="text-5xl mb-6 text-zinc-300">🏢</div>
        <h3 class="text-xl font-light text-zinc-600 mb-3">{{ t('apartments.no_results') || 'No apartments found' }}</h3>
        <p class="text-zinc-500 font-light">{{ t('apartments.try_adjusting_filters') || 'Try adjusting your search criteria' }}</p>
      </div>

      <div v-else>
        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-12">
          <ApartmentCard
            v-for="apt in apartments"
            :key="apt.id"
            :apartment="mapToDetail(apt)"
            @click="navigateToApartment(apt)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="lastPage > 1" class="flex justify-center gap-2">
          <!-- Prev Button -->
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 1"
            class="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          
          <!-- First Page -->
          <button
            @click="handlePageChange(1)"
            class="w-10 h-10 flex items-center justify-center rounded-lg border transition-colors font-medium"
            :class="currentPage === 1 ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
          >
            1
          </button>

          <!-- Ellipsis Start -->
          <span v-if="currentPage > 3" class="w-10 h-10 flex items-center justify-center text-zinc-400">...</span>

          <!-- Pages Around Current -->
          <template v-for="page in lastPage" :key="page">
            <button
              v-if="page !== 1 && page !== lastPage && Math.abs(page - currentPage) <= 1"
              @click="handlePageChange(page)"
              class="w-10 h-10 flex items-center justify-center rounded-lg border transition-colors font-medium"
              :class="currentPage === page ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
            >
              {{ page }}
            </button>
          </template>

          <!-- Ellipsis End -->
          <span v-if="currentPage < lastPage - 2" class="w-10 h-10 flex items-center justify-center text-zinc-400">...</span>

          <!-- Last Page -->
          <button
            v-if="lastPage > 1"
            @click="handlePageChange(lastPage)"
            class="w-10 h-10 flex items-center justify-center rounded-lg border transition-colors font-medium"
            :class="currentPage === lastPage ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
          >
            {{ lastPage }}
          </button>

          <!-- Next Button -->
          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage === lastPage"
            class="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
