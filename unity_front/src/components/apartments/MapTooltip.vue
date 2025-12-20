<template>
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <!-- Building/Floor tooltip (has stats) -->
      <div
        v-if="zone && 'stats' in zone"
        class="tooltip-container fixed pointer-events-none z-[9999] bg-white/95 backdrop-blur-md rounded-xl shadow-xl ring-1 ring-zinc-100 px-5 py-3 transform transition-all duration-200"
        :style="style"
      >
        <div class="text-zinc-900 font-light text-sm mb-1 tracking-wide">
          {{ label }}
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-zinc-400 text-xs uppercase tracking-wider">{{ t('apartments.available') || 'Available' }}</span>
          <div class="flex items-center gap-1.5">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span class="font-medium text-zinc-900 text-sm">{{ zone.stats.available }}</span>
          </div>
        </div>
      </div>
      
      <!-- Apartment tooltip -->
      <div
        v-else-if="zone && 'apartment_number' in zone"
        class="tooltip-container fixed pointer-events-none z-[9999] bg-white/95 backdrop-blur-md rounded-xl shadow-xl ring-1 ring-zinc-100 px-6 py-4 min-w-[140px] transform transition-all duration-200"
        :style="style"
      >
        <div class="flex items-center justify-between mb-2 gap-4">
          <span class="text-zinc-400 text-xs uppercase tracking-wider">{{ t('common.apt') || 'Apt.' }}</span>
          <div 
            class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
            :class="{
              'bg-emerald-100 text-emerald-700': zone.status === 'available',
              'bg-[#FFCD4B]/20 text-yellow-700': zone.status === 'reserved',
              'bg-zinc-100 text-zinc-500': zone.status === 'sold'
            }"
          >
            {{ statusLabel }}
          </div>
        </div>
        <div class="text-zinc-900 font-light text-3xl mb-1">
          {{ zone.apartment_number }}
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-zinc-500 text-sm font-light">{{ zone.area_total || 'N/A' }} {{ t('common.sqm') || 'm²' }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { BuildingZone, FloorZone, ApartmentZone } from '@/types/apartments'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

defineProps<{
  zone: BuildingZone | FloorZone | ApartmentZone | null
  style: Record<string, string>
  label: string
  statusLabel: string
}>()
</script>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
