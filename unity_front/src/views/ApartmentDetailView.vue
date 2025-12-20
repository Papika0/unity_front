<template>
  <div 
    class="apartment-detail-view transition-colors duration-500"
    :class="[
      isInline ? 'bg-white min-h-0 text-zinc-900' : 'min-h-screen bg-zinc-950 text-white'
    ]"
  >
    <!-- Header Navigation (Only show if NOT inline) -->
    <header v-if="!isInline" class="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div class="max-w-[1920px] mx-auto px-6 h-20 flex items-center justify-between">
        <button
          @click="goBack"
          class="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors"
        >
          <div class="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-[#FFCD4B] group-hover:bg-[#FFCD4B]/10 transition-all">
            <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div class="flex flex-col items-start">
            <span class="text-xs uppercase tracking-widest text-[#FFCD4B]">{{ t('apartments.floor') }} {{ props.floorNumber }}</span>
            <span class="text-sm font-light">{{ t('common.back') }}</span>
          </div>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main 
      class="flex items-center w-full" 
      :class="[isInline ? 'mt-4 lg:mt-8' : 'pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 lg:px-6 min-h-screen']"
    >
      <!-- Loading State -->
      <div v-if="isLoading" class="w-full flex flex-col items-center justify-center min-h-[400px]">
        <div class="w-12 h-12 border-2 border-zinc-200 border-t-[#FFCD4B] rounded-full animate-spin mb-4"></div>
        <p class="text-zinc-400 font-light tracking-widest uppercase text-sm">{{ t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="w-full text-center py-20">
        <div class="inline-block p-4 rounded-full bg-red-50 text-red-500 mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h2 class="text-xl font-light mb-2 text-zinc-900">{{ t('apartments.error_loading') }}</h2>
        <p class="text-zinc-500 mb-6">{{ error }}</p>
        <button @click="loadData" class="px-6 py-2 bg-zinc-900 text-white hover:bg-[#FFCD4B] hover:text-black transition-colors rounded-full uppercase tracking-wider text-xs font-medium">
          {{ t('buttons.retry') }}
        </button>
      </div>

      <!-- Detail Content -->
      <div v-else-if="apartment" class="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 items-start">
        
        <!-- Left Column: Visuals (Floor Plan) -->
        <div class="lg:col-span-7 relative order-2 lg:order-1">
          <div class="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 lg:p-12 relative overflow-hidden group transition-all duration-500 hover:shadow-xl hover:shadow-zinc-200/50">
             
             <!-- Back Button (Inline Only) -->
             <button 
                v-if="isInline"
                @click="goBack"
                class="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all shadow-sm"
                :title="t('common.back')"
             >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" /></svg>
             </button>

             <!-- Compass / Meta -->
             <div class="absolute top-4 right-4 lg:top-6 lg:right-6 flex flex-col gap-2 items-end z-10">
                <div 
                  class="px-4 py-1.5 rounded-full bg-white border border-zinc-200 uppercase tracking-widest text-[10px] font-bold shadow-sm"
                  :class="getStatusClasses(apartment.status)"
                >
                  {{ t(`status.${apartment.status}`) }}
                </div>
             </div>

             <!-- Image -->
             <div v-if="apartment.floor_plan_image" class="w-full aspect-[4/3] flex items-center justify-center">
                <img :src="apartment.floor_plan_image" :alt="`Apartment ${apartment.apartment_number}`" class="max-w-full max-h-full object-contain mix-blend-multiply filter hover:scale-105 transition-transform duration-700">
             </div>
             <div v-else class="w-full aspect-[4/3] flex flex-col items-center justify-center">
                <svg class="w-16 h-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p class="text-zinc-400 font-light text-sm">{{ t('apartments.no_plan_image') }}</p>
             </div>
          </div>
        </div>

        <!-- Right Column: Info -->
        <div class="lg:col-span-5 space-y-6 lg:space-y-10 py-0 lg:py-4 order-1 lg:order-2">
          
          <!-- Identity -->
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="text-[#FFCD4B] text-xss lg:text-xs font-bold uppercase tracking-widest">
                {{ apartment.building.name }} &bull; {{ t('apartments.floor') }} {{ apartment.floor_number }}
              </span>
            </div>
            <h1 class="text-4xl lg:text-6xl font-extralight tracking-tight text-zinc-900 mb-4 lg:mb-6">
              <span class="text-zinc-300 text-2xl lg:text-3xl mr-1 font-thin">N.</span>{{ apartment.apartment_number }}
            </h1>
            
            <!-- Price Block -->
            <div class="inline-block">
               <div class="text-zinc-400 text-[10px] uppercase tracking-widest mb-1">{{ t('apartments.price') }}</div>
               <div class="text-3xl lg:text-4xl font-light text-zinc-900 tracking-tight">
                 <span v-if="apartment.price">${{ formatPrice(apartment.price) }}</span>
                 <span v-else class="text-xl text-zinc-500 uppercase">{{ t('common.price_on_request') }}</span>
               </div>
            </div>
          </div>

          <div class="w-12 h-px bg-[#FFCD4B]"></div>

          <!-- Key Stats Grid -->
          <div class="grid grid-cols-2 gap-x-8 gap-y-8">
            <!-- Total Area -->
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                {{ t('apartments.area_total') }}
              </div>
              <div class="text-2xl font-light text-zinc-900">
                {{ apartment.area_total }} <span class="text-zinc-400 text-sm font-normal">m²</span>
              </div>
            </div>

             <!-- Living Area -->
             <div class="space-y-1">
              <div class="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                {{ t('apartments.area_living') }}
              </div>
              <div class="text-2xl font-light text-zinc-900">
                {{ apartment.area_living || '—' }} <span class="text-zinc-400 text-sm font-normal">m²</span>
              </div>
            </div>

            <!-- Bedrooms -->
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                {{ t('apartments.bedrooms') }}
              </div>
              <div class="text-2xl font-light text-zinc-900">
                {{ apartment.bedrooms || '—' }}
              </div>
            </div>

            <!-- Bathrooms -->
             <div class="space-y-1">
              <div class="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                {{ t('apartments.bathrooms') }}
              </div>
              <div class="text-2xl font-light text-zinc-900">
                {{ apartment.bathrooms || '—' }}
              </div>
            </div>
          </div>

          <!-- Room Internal Dimensions -->
          <div v-if="roomList.length > 0" class="pt-6 border-t border-zinc-100">
            <h3 class="text-xs uppercase tracking-widest text-zinc-400 mb-4">{{ t('apartments.rooms.dimensions') }}</h3>
            <div class="space-y-3">
              <div 
                v-for="(room, index) in roomList" 
                :key="index"
                class="flex items-center justify-between text-sm group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:border-[#FFCD4B] group-hover:text-[#FFCD4B] transition-all">
                    <component :is="room.icon" class="w-4 h-4" stroke-width="1.5" />
                  </div>
                  <span class="text-zinc-600 font-light">{{ room.label }}</span>
                </div>
                <div class="flex items-center gap-1 font-medium text-zinc-900 border-b border-zinc-100 border-dashed pb-0.5">
                  {{ room.area }} <span class="text-zinc-400 font-normal text-xs">m²</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-col gap-4 pt-6 mt-4 border-t border-zinc-100">
             <button class="w-full py-4 bg-[#FFCD4B] text-black font-semibold uppercase tracking-widest hover:bg-[#ffda7a] transition-all duration-300 rounded-xl shadow-lg shadow-[#FFCD4B]/20 flex items-center justify-center gap-2 group">
                {{ t('common.contact_us') }}
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
             </button>
             <button class="w-full py-4 border border-zinc-200 text-zinc-600 hover:text-black hover:border-black hover:bg-zinc-50 uppercase tracking-widest text-xs font-medium rounded-xl transition-all duration-300">
                {{ t('common.download_pdf') }}
             </button>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useApartmentDetail } from './apartments/composables'

interface Props {
  projectId: number
  buildingIdentifier: string
  floorNumber: number
  apartmentId: number
  isInline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isInline: false
})

const emit = defineEmits<{
  'back': []
}>()

const {
  t,
  apartmentStore,
  apartment,
  isLoading,
  error,
  roomList,
  loadData,
  goBack,
  formatPrice,
  getStatusClasses,
} = useApartmentDetail(props, () => emit('back'))
</script>

<style scoped>
/* Additional specific styles if needed */
</style>
