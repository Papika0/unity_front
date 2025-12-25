<template>
  <div 
    class="group block bg-white border border-zinc-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 cursor-pointer min-w-[240px]"
    @click="$emit('click')"
  >
    <!-- Image Aspect Ratio Container -->
    <div class="aspect-[4/3] bg-zinc-50 relative overflow-hidden flex items-center justify-center p-2 border-b border-zinc-50">
      <img 
        v-if="apartment.image" 
        :src="apartment.image" 
        :alt="`Apartment ${apartment.apartment_number}`"
        class="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
      >
      <div v-else class="flex flex-col items-center justify-center text-zinc-300">
        <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <span class="text-xs font-light">{{ t('apartments.no_image') }}</span>
      </div>


    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-2xl font-light text-zinc-900 leading-none">
              <span class="text-zinc-300 text-base mr-0.5">N.</span>{{ apartment.apartment_number }}
            </h3>
          </div>
          <p class="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-1">
            {{ apartment.project?.title }}
          </p>
          <p class="text-xs text-zinc-400 font-medium uppercase tracking-wider">
            {{ apartment.building?.name }} • {{ t('apartments.floor') }} {{ apartment.floor_number }}
          </p>
        </div>
      </div>

      <!-- Specs Grid -->
      <div class="grid grid-cols-2 gap-y-2 gap-x-4">
        <!-- Area -->
        <div class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
          <span class="text-sm font-light text-zinc-700">{{ apartment.area_total }} <span class="text-zinc-400 text-xs">m²</span></span>
        </div>

        <!-- Bedrooms -->
        <div class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h.75v-1.5h15v1.5h.75M2.25 15V5.625c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125V15M4.5 10.5h15M4.5 7.5h7.5"/></svg>
          <span class="text-sm font-light text-zinc-700">{{ apartment.bedrooms }}</span>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApartmentDetail } from '@/types/apartments'
import { useTranslations } from '@/composables/i18n/useTranslations'

defineProps<{
  apartment: ApartmentDetail
}>()

defineEmits<{
  (e: 'click'): void
}>()

const { t } = useTranslations()


</script>
