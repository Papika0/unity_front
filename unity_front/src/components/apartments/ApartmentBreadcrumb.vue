<template>
  <Transition name="fade-slide">
    <nav 
      v-if="selectedBuilding || selectedFloor"
      class="breadcrumb-nav overflow-x-auto whitespace-nowrap scrollbar-hide -mx-4 px-4 py-2 lg:mx-0 lg:p-0"
    >
      <div class="flex items-center gap-2 text-sm min-w-max">
        <!-- Home Button -->
        <button
          @click="$emit('reset-to-buildings')"
          class="breadcrumb-item group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-zinc-50"
          :class="{'breadcrumb-active': !selectedBuilding}"
        >
          <svg class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="font-light">{{ t('apartments.all_buildings') }}</span>
        </button>
        
        <!-- Building Level -->
        <template v-if="selectedBuilding">
          <svg class="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          
          <button
            v-if="selectedFloor"
            @click="$emit('reset-to-floors')"
            class="breadcrumb-item group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-zinc-50"
          >
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="font-light">{{ selectedBuilding.label }}</span>
          </button>
          
          <div
            v-else
            class="breadcrumb-item breadcrumb-active flex items-center gap-2 px-3 py-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="font-medium">{{ selectedBuilding.label }}</span>
          </div>
        </template>

        <!-- Floor Level -->
        <template v-if="selectedFloor">
          <svg class="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          
          <button
            v-if="selectedApartmentId"
            @click="$emit('apartment-back')"
            class="breadcrumb-item group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-zinc-50"
          >
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span class="font-light">{{ t('apartments.floor') }} {{ selectedFloor.floor_number }}</span>
          </button>
          
          <div
            v-else
            class="breadcrumb-item breadcrumb-active flex items-center gap-2 px-3 py-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span class="font-medium">{{ t('apartments.floor') }} {{ selectedFloor.floor_number }}</span>
          </div>
        </template>

        <!-- Apartment Level -->
        <template v-if="selectedApartmentId">
          <svg class="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          
          <div class="breadcrumb-item breadcrumb-active flex items-center gap-2 px-3 py-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="font-medium">{{ t('apartments.apartment') }}</span>
          </div>
        </template>
      </div>
    </nav>
  </Transition>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { BuildingZone, FloorZone } from '@/types/apartments'

defineProps<{
  selectedBuilding: BuildingZone | null
  selectedFloor: FloorZone | null
  selectedApartmentId: number | null
}>()

defineEmits<{
  'reset-to-buildings': []
  'reset-to-floors': []
  'apartment-back': []
}>()

const { t } = useTranslations()
</script>

<style scoped>
/* Breadcrumb styling - luxury minimalist design */
.breadcrumb-nav {
  background: linear-gradient(to bottom, rgba(255,205,75,0.03), transparent);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.breadcrumb-item {
  color: #71717a; /* zinc-500 */
  position: relative;
}

.breadcrumb-item:hover {
  color: #FFCD4B;
}

.breadcrumb-item.breadcrumb-active {
  color: #18181b; /* zinc-900 */
  background: rgba(255,205,75,0.08);
  border: 1px solid rgba(255,205,75,0.2);
}

.breadcrumb-item.breadcrumb-active::before {
  content: '';
  position: absolute;
  bottom: -1.25rem;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #FFCD4B, #EBB738, #C89116);
  opacity: 0.6;
}

/* Fade slide transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
