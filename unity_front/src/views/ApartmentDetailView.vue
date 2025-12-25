<template>
  <div 
    class="apartment-detail-view transition-colors duration-500"
    :class="[
      isInline ? 'bg-white min-h-0 text-zinc-900' : 'min-h-screen bg-white text-zinc-900'
    ]"
  >
    <!-- Header Navigation (Only show if NOT inline) -->
    <header v-if="!isInline" class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div class="max-w-[1920px] mx-auto px-6 h-20 flex items-center justify-between">
        <button
          @click="goBack"
          class="group flex items-center gap-3 text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <div class="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-[#FFCD4B] group-hover:bg-[#FFCD4B]/10 transition-all">
            <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div class="flex flex-col items-start">
            <span v-if="props.floorNumber" class="text-xs uppercase tracking-widest text-[#FFCD4B]">{{ t('apartments.floor') }} {{ props.floorNumber }}</span>
            <span class="text-sm font-light">{{ props.floorNumber ? t('common.back') : t('apartments.back_to_search') }}</span>
          </div>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main 
      class="flex items-center w-full" 
      :class="[isInline ? 'mt-4 lg:mt-8' : 'pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 lg:px-6 min-h-screen']"
    >
      <Transition name="fade" mode="out-in">
        <!-- Loading State -->
        <div v-if="isLoading" class="w-full flex flex-col items-center justify-center min-h-[400px]" key="loading">
          <div class="w-12 h-12 border-2 border-zinc-200 border-t-[#FFCD4B] rounded-full animate-spin mb-4"></div>
          <p class="text-zinc-400 font-light tracking-widest uppercase text-sm">{{ t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="w-full text-center py-20" key="error">
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
        <div v-else-if="apartment" class="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 items-start" key="content">
          
          <!-- Left Column: Visuals (Floor Plan) -->
          <div class="lg:col-span-7 relative order-1">
          <!-- Navigation Bar (Inline Only) -->
          <div v-if="isInline" class="flex items-center justify-between mb-4 gap-4">
             <button 
                @click="goBack"
                class="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all shadow-sm shrink-0"
                :title="t('common.back')"
             >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" /></svg>
             </button>

             <!-- 2D/3D Toggle (Inline Version) -->
             <div v-if="apartment.image_2d?.url || apartment.image_3d?.url" class="flex gap-1 bg-zinc-100/50 rounded-full p-1 border border-zinc-200/50">
               <button
                 @click="viewMode = '2d'"
                 class="px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300"
                 :class="viewMode === '2d' ? 'bg-[#FFCD4B] text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-800'"
               >
                 {{ t('apartments.view_2d') }}
               </button>
               <button
                 @click="viewMode = '3d'"
                 class="px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300"
                 :class="viewMode === '3d' ? 'bg-[#FFCD4B] text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-800'"
               >
                 {{ t('apartments.view_3d') }}
               </button>
             </div>
          </div>

          <div class="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 lg:p-12 relative overflow-hidden group transition-all duration-500 hover:shadow-xl hover:shadow-zinc-200/50">
             
             <!-- 2D/3D Toggle (Desktop/Non-inline Version) -->
             <div v-if="!isInline && (apartment.image_2d?.url || apartment.image_3d?.url)" class="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 flex gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-zinc-200">
               <button
                 @click="viewMode = '2d'"
                 class="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200"
                 :class="viewMode === '2d' ? 'bg-[#FFCD4B] text-black' : 'text-zinc-500 hover:text-zinc-900'"
               >
                 {{ t('apartments.view_2d') }}
               </button>
               <button
                 @click="viewMode = '3d'"
                 class="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200"
                 :class="viewMode === '3d' ? 'bg-[#FFCD4B] text-black' : 'text-zinc-500 hover:text-zinc-900'"
               >
                 {{ t('apartments.view_3d') }}
               </button>
             </div>

             <!-- Image Display -->
             <div class="w-full aspect-[4/3] flex items-center justify-center cursor-pointer relative" @click="openLightbox">
              <Transition :name="transitionName">
                <!-- 2D Image -->
                <img 
                  v-if="viewMode === '2d' && apartment.image_2d?.url" 
                  :key="'2d'"
                  :src="apartment.image_2d.url" 
                  :alt="`${apartment.apartment_number} - 2D`" 
                  class="max-w-full max-h-full object-contain mix-blend-multiply filter hover:scale-105 transition-transform duration-700 absolute inset-0 m-auto"
                >
                <!-- 3D Image -->
                <img 
                  v-else-if="viewMode === '3d' && apartment.image_3d?.url" 
                  :key="'3d'"
                  :src="apartment.image_3d.url" 
                  :alt="`${apartment.apartment_number} - 3D`" 
                  class="max-w-full max-h-full object-contain mix-blend-multiply filter hover:scale-105 transition-transform duration-700 absolute inset-0 m-auto"
                >
                <!-- Fallback to floor_plan_image -->
                <img 
                  v-else-if="apartment.floor_plan_image" 
                  :key="'plan'"
                  :src="apartment.floor_plan_image" 
                  :alt="`Apartment ${apartment.apartment_number}`" 
                  class="max-w-full max-h-full object-contain mix-blend-multiply filter hover:scale-105 transition-transform duration-700 absolute inset-0 m-auto"
                >
                <!-- No image placeholder -->
                <div v-else key="empty" class="flex flex-col items-center justify-center absolute inset-0 m-auto">
                  <svg class="w-16 h-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <p class="text-zinc-400 font-light text-sm">{{ t('apartments.no_image') }}</p>
                </div>
              </Transition>
             </div>

             <!-- Click to expand hint -->
             <div v-if="currentImageUrl" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-zinc-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
               <span>{{ t('apartments.click_to_expand') }}</span>
             </div>
          </div>
        </div>

        <!-- Right Column: Info -->
        <div class="lg:col-span-5 space-y-6 lg:space-y-10 py-0 lg:py-4 order-2">
          
          <!-- Identity -->
          <div>
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <span class="text-[#FFCD4B] text-xss lg:text-xs font-bold uppercase tracking-widest">
                {{ apartment.building.name }} &bull; {{ t('apartments.floor') }} {{ apartment.floor_number }}
              </span>
              <div 
                class="px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider"
                :class="getStatusClasses(apartment.status)"
              >
                {{ t(`status.${apartment.status}`) }}
              </div>
            </div>
            <h1 class="text-4xl lg:text-6xl font-extralight tracking-tight text-zinc-900 mb-4 lg:mb-6">
              <span class="text-zinc-300 text-2xl lg:text-3xl mr-1 font-thin">N.</span>{{ apartment.apartment_number }}
            </h1>
          </div>

          <div class="w-12 h-px bg-[#FFCD4B]"></div>

          <!-- Key Stats Grid -->
          <div class="grid grid-cols-2 gap-x-8 gap-y-8">
            <!-- Total Area -->
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
                <!-- Ruler/Expand icon -->
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                </svg>
                {{ t('apartments.area_total') }}
              </div>
              <div class="text-2xl font-light text-zinc-900">
                {{ apartment.area_total }} <span class="text-zinc-400 text-sm font-normal">m²</span>
              </div>
            </div>

             <!-- Living Area -->
             <div class="space-y-1">
              <div class="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
                <!-- Home/House icon -->
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                </svg>
                {{ t('apartments.area_living') }}
              </div>
              <div class="text-2xl font-light text-zinc-900">
                {{ apartment.area_living || '—' }} <span class="text-zinc-400 text-sm font-normal">m²</span>
              </div>
            </div>

            <!-- Bedrooms -->
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
                <!-- Bed icon -->
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h.75v-1.5h15v1.5h.75M2.25 15V5.625c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125V15M4.5 10.5h15M4.5 7.5h7.5"/>
                </svg>
                {{ t('apartments.bedrooms') }}
              </div>
              <div class="text-2xl font-light text-zinc-900">
                {{ apartment.bedrooms || '—' }}
              </div>
            </div>

            <!-- Bathrooms -->
             <div class="space-y-1">
              <div class="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest">
                <!-- Droplet/Bathroom icon -->
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 2.4-4 5-4 8a4 4 0 108 0c0-3-2.8-5.6-4-8z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 17v1m-2-1.5l-.5.866M14 15.5l.5.866"/>
                </svg>
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
          <div class="flex flex-col gap-3 pt-6 mt-4 border-t border-zinc-100">
             <!-- Contact Us Button -->
             <button 
               @click="navigateToContact"
               class="w-full py-4 bg-[#FFCD4B] text-black font-semibold uppercase tracking-widest hover:bg-[#ffda7a] transition-all duration-300 rounded-xl shadow-lg shadow-[#FFCD4B]/20 flex items-center justify-center gap-3 group"
             >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                {{ t('common.contact_us') }}
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
             </button>

             <!-- Request Call Button -->
             <button 
               @click="openPhoneModal"
               class="w-full py-4 bg-zinc-900 text-white font-semibold uppercase tracking-widest hover:bg-zinc-800 transition-all duration-300 rounded-xl shadow-lg flex items-center justify-center gap-3 group"
             >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                {{ t('apartments.request_call') }}
             </button>

             <!-- Share Button -->
             <button 
               @click="copyLink"
               class="w-full py-4 border border-zinc-200 text-zinc-600 hover:text-black hover:border-black hover:bg-zinc-50 uppercase tracking-widest text-xs font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {{ t('common.share') }}
             </button>

             <!-- Download PDF Button -->
             <button 
               @click="downloadPDF"
               :disabled="isGeneratingPDF"
               class="w-full py-4 border border-zinc-200 text-zinc-600 hover:text-black hover:border-black hover:bg-zinc-50 uppercase tracking-widest text-xs font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <svg v-if="!isGeneratingPDF" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isGeneratingPDF ? t('apartments.generating_pdf') : t('common.download_pdf') }}
             </button>
          </div>


      </div>

          <!-- Similar Apartments Section -->
          <div v-if="apartment.similar_apartments && apartment.similar_apartments.length > 0" class="col-span-1 lg:col-span-12 pt-16 border-t border-zinc-100 mt-8 order-3">
            <h2 class="text-2xl font-light text-zinc-900 mb-8">{{ t('apartments.similar_apartments') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ApartmentCard 
                v-for="similar in apartment.similar_apartments" 
                :key="similar.id" 
                :apartment="similar"
                @click="handleSimilarClick(similar)"
              />
            </div>
          </div>

        </div>
      </Transition>
    </main>


  <!-- Lightbox Modal -->
  <Teleport to="body">
    <Transition name="lightbox">
      <div 
        v-if="lightboxOpen && currentImageUrl" 
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click="closeLightbox"
        @wheel.prevent="handleWheel"
      >
        <!-- Close button -->
        <button 
          class="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
          @click.stop="closeLightbox"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Zoom Controls -->
        <div class="absolute top-6 right-24 z-10 hidden md:flex gap-2">
          <button 
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
            @click.stop="zoomIn"
            :title="t('apartments.zoom_in')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
            </svg>
          </button>
          <button 
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
            @click.stop="zoomOut"
            :title="t('apartments.zoom_out')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/>
            </svg>
          </button>
          <button 
            v-if="zoomLevel !== 1 || panX !== 0 || panY !== 0"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
            @click.stop="resetZoom"
            :title="t('apartments.reset_zoom')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>

        <!-- 2D/3D Toggle in Lightbox -->
        <div v-if="apartment?.image_2d?.url && apartment?.image_3d?.url" class="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-white/10 backdrop-blur-sm rounded-full p-1">
          <button
            @click.stop="viewMode = '2d'"
            class="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
            :class="viewMode === '2d' ? 'bg-[#FFCD4B] text-black' : 'text-white/70 hover:text-white'"
          >
            {{ t('apartments.view_2d') }}
          </button>
          <button
            @click.stop="viewMode = '3d'"
            class="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
            :class="viewMode === '3d' ? 'bg-[#FFCD4B] text-black' : 'text-white/70 hover:text-white'"
          >
            {{ t('apartments.view_3d') }}
          </button>
        </div>

        <!-- Image Container with zoom/pan -->
        <div 
          class="relative overflow-hidden select-none"
          :class="zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'"
          @click.stop="zoomLevel === 1 ? zoomIn() : null"
          @dblclick.stop="resetZoom"
          @mousedown.stop="startPan"
          @mousemove="onPan"
          @mouseup="endPan"
          @mouseleave="endPan"
          @touchstart.stop="handleTouchStart"
          @touchmove.prevent="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <img 
            :src="currentImageUrl" 
            :alt="apartment?.apartment_number"
            class="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-150"
            :style="{
              transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`,
            }"
            draggable="false"
          >
        </div>

        <!-- Zoom Level Indicator -->
        <div v-if="zoomLevel !== 1" class="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 rounded-full text-white text-sm font-medium">
          {{ Math.round(zoomLevel * 100) }}%
        </div>

        <!-- Hint -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm text-center">
          <span v-if="zoomLevel === 1">{{ t('apartments.scroll_to_zoom') }}</span>
          <span v-else>{{ t('apartments.drag_to_pan') }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>

  <PhoneModal 
    :is-open="isPhoneModalOpen" 
    @close="closePhoneModal" 
    @submit="handlePhoneSubmit" 
  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useApartmentDetail } from './apartments/composables'
import PhoneModal from '@/components/ui/PhoneModal.vue'
import { useToastStore } from '@/stores/ui/toast'
import { customerApi, type CustomerData } from '@/services/customerApi'
import ApartmentCard from '@/components/apartments/ApartmentCard.vue'
import type { ApartmentDetail } from '@/types/apartments'
import jsPDF from 'jspdf'

interface Props {
  apartmentId: number
  projectId?: number
  buildingIdentifier?: string
  floorNumber?: number
  isInline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isInline: false
})

const emit = defineEmits<{
  'back': []
}>()

// View mode for 2D/3D toggle
const viewMode = ref<'2d' | '3d'>('2d')
const transitionName = ref('view-fade')

watch(viewMode, (newVal, oldVal) => {
  if (newVal === '3d' && oldVal === '2d') {
    transitionName.value = 'view-slide-left'
  } else if (newVal === '2d' && oldVal === '3d') {
    transitionName.value = 'view-slide-right'
  } else {
    transitionName.value = 'view-fade'
  }
})

// Lightbox state
const lightboxOpen = ref(false)

// Router and stores
const router = useRouter()
const toastStore = useToastStore()

// Phone modal state
const isPhoneModalOpen = ref(false)

// PDF generation state
const isGeneratingPDF = ref(false)

// Zoom and pan state
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const lastPan = ref({ x: 0, y: 0 })

// Touch zoom state
const lastTouchDistance = ref(0)

const {
  t,
  apartment,
  isLoading,
  error,
  roomList,
  loadData,
  goBack,

  getStatusClasses,
} = useApartmentDetail(props, () => emit('back'))

// Current image URL based on view mode
const currentImageUrl = computed(() => {
  if (viewMode.value === '2d' && apartment.value?.image_2d?.url) {
    return apartment.value.image_2d.url
  }
  if (viewMode.value === '3d' && apartment.value?.image_3d?.url) {
    return apartment.value.image_3d.url
  }
  return apartment.value?.floor_plan_image || null
})

// Reset zoom when image changes
watch(currentImageUrl, () => {
  resetZoom()
})

// Open lightbox
function openLightbox() {
  if (currentImageUrl.value) {
    lightboxOpen.value = true
    resetZoom()
  }
}

// Close lightbox
function closeLightbox() {
  if (zoomLevel.value === 1) {
    lightboxOpen.value = false
  } else {
    resetZoom()
  }
}

// Zoom functions
function zoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value * 1.5, 5)
}

function zoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value / 1.5, 1)
  if (zoomLevel.value === 1) {
    panX.value = 0
    panY.value = 0
  }
}

function resetZoom() {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

// Mouse wheel zoom
function handleWheel(e: WheelEvent) {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// Pan functions
function startPan(e: MouseEvent) {
  if (zoomLevel.value > 1) {
    isPanning.value = true
    panStart.value = { x: e.clientX, y: e.clientY }
    lastPan.value = { x: panX.value, y: panY.value }
  }
}

function onPan(e: MouseEvent) {
  if (isPanning.value && zoomLevel.value > 1) {
    const dx = e.clientX - panStart.value.x
    const dy = e.clientY - panStart.value.y
    panX.value = lastPan.value.x + dx
    panY.value = lastPan.value.y + dy
  }
}

function endPan() {
  isPanning.value = false
}

// Touch handlers for mobile
function handleTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    // Pinch zoom start
    lastTouchDistance.value = getTouchDistance(e.touches)
  } else if (e.touches.length === 1 && zoomLevel.value > 1) {
    // Pan start
    isPanning.value = true
    panStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    lastPan.value = { x: panX.value, y: panY.value }
  }
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    // Pinch zoom
    const distance = getTouchDistance(e.touches)
    if (lastTouchDistance.value > 0) {
      const scale = distance / lastTouchDistance.value
      zoomLevel.value = Math.max(1, Math.min(5, zoomLevel.value * scale))
    }
    lastTouchDistance.value = distance
  } else if (e.touches.length === 1 && isPanning.value && zoomLevel.value > 1) {
    // Pan
    const dx = e.touches[0].clientX - panStart.value.x
    const dy = e.touches[0].clientY - panStart.value.y
    panX.value = lastPan.value.x + dx
    panY.value = lastPan.value.y + dy
  }
}

function handleTouchEnd() {
  isPanning.value = false
  lastTouchDistance.value = 0
}

function getTouchDistance(touches: TouchList): number {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  )
}

// Navigation functions
function navigateToContact() {
  router.push('/contact')
}

// Phone modal functions
function openPhoneModal() {
  isPhoneModalOpen.value = true
}

function closePhoneModal() {
  isPhoneModalOpen.value = false
}

function handleSimilarClick(similar: ApartmentDetail) {
  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })

  if (props.isInline) {
    // Inline mode - update query
    router.replace({
      query: {
        ...router.currentRoute.value.query,
        apartment: similar.id.toString(),
        floor: similar.floor_number.toString()
      }
    })
  } else {
    // Standalone mode
    router.push({
      name: 'apartment-detail-global',
      params: {
        id: similar.id
      }
    })
  }
}


interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

async function handlePhoneSubmit(formData: FormData) {
  try {
    const customerData: CustomerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message + `\n\n[Apartment: ${apartment.value?.apartment_number}, Building: ${apartment.value?.building?.name}]`,
      source: 'call_request',
    }

    const response = await customerApi.submit(customerData)

    if (response.success) {
      toastStore.success(
        t('messages.phone_success_title') || 'მოთხოვნა გაგზავნილია',
        response.message || t('messages.phone_success_message') || 'ჩვენ მალე დაგიკავშირდებით',
      )
    } else {
      throw new Error(response.message || 'დაფიქსირდა შეცდომა')
    }
  } catch (err: unknown) {
    const error = err as { message?: string }
    toastStore.error(
      t('messages.error_title') || 'შეცდომა',
      error.message || t('messages.error_message') || 'გთხოვთ სცადოთ მოგვიანებით',
    )
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  toastStore.success(t('common.link_copied'))
}

// PDF Generation - Uses html2canvas to properly render Georgian fonts
async function downloadPDF() {
  if (!apartment.value || isGeneratingPDF.value) return
  
  isGeneratingPDF.value = true
  
  try {
    // Dynamically import html2canvas
    const html2canvasModule = await import('html2canvas')
    const html2canvas = html2canvasModule.default
    
    const apt = apartment.value
    
    // Create a temporary container for PDF content
    // A4 size at 96 DPI: 794px x 1123px
    const container = document.createElement('div')
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 794px;
      min-height: 1123px;
      padding: 0;
      margin: 0;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      overflow: hidden;
    `
    
    // Get status color and translated label
    const statusColors: Record<string, string> = {
      available: '#22c55e',
      sold: '#ef4444',
      reserved: '#fbbf24'
    }
    const statusColor = statusColors[apt.status || 'available'] || '#22c55e'
    
    // Translate status
    const statusLabels: Record<string, string> = {
      available: t('status.available'),
      sold: t('status.sold'),
      reserved: t('status.reserved')
    }
    const statusLabel = statusLabels[apt.status || 'available'] || apt.status || t('status.available')
    
    // Build HTML content
    container.innerHTML = `
      <div style="background: white; width: 794px; min-height: 1123px; display: flex; flex-direction: column; position: relative;">
        <!-- Header -->
        <div style="background: #FFCD4B; padding: 30px 40px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 32px; font-weight: bold; color: black;">UNITY</div>
          <div style="text-align: right; color: #333;">
            <div style="font-size: 14px; font-weight: 600;">${apt.building?.name || ''}</div>
            <div style="font-size: 12px; margin-top: 4px;">${t('apartments.floor')} ${apt.floor_number}</div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px; flex-grow: 1;">
          <!-- Apartment Number -->
          <div style="margin-bottom: 20px;">
            <span style="color: #ccc; font-size: 28px; font-weight: 200;">N.</span>
            <span style="font-size: 48px; font-weight: 300; color: #1a1a1a;">${apt.apartment_number}</span>
          </div>
          
          <!-- Status Badge -->
          <div style="margin-bottom: 25px;">
            <span style="background: ${statusColor}; color: white; padding: 6px 16px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
              ${statusLabel}
            </span>
          </div>
          
          <!-- Divider -->
          <div style="width: 40px; height: 3px; background: #FFCD4B; margin-bottom: 30px;"></div>
          
          <!-- Stats Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
            <div>
              <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">${t('apartments.area_total')}</div>
              <div style="font-size: 28px; font-weight: 300; color: #1a1a1a;">${apt.area_total} <span style="font-size: 14px; color: #888;">m²</span></div>
            </div>
            <div>
              <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">${t('apartments.area_living')}</div>
              <div style="font-size: 28px; font-weight: 300; color: #1a1a1a;">${apt.area_living || '—'} <span style="font-size: 14px; color: #888;">m²</span></div>
            </div>
            <div>
              <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">${t('apartments.bedrooms')}</div>
              <div style="font-size: 28px; font-weight: 300; color: #1a1a1a;">${apt.bedrooms || '—'}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">${t('apartments.bathrooms')}</div>
              <div style="font-size: 28px; font-weight: 300; color: #1a1a1a;">${apt.bathrooms || '—'}</div>
            </div>
          </div>
          
          ${roomList.value && roomList.value.length > 0 ? `
            <!-- Room Dimensions -->
            <div style="border-top: 1px solid #eee; padding-top: 25px; margin-bottom: 40px;">
              <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">${t('apartments.rooms.dimensions')}</div>
              ${roomList.value.map((room: { label: string; area: number }) => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee;">
                  <span style="color: #555; font-size: 13px;">${room.label}</span>
                  <span style="color: #1a1a1a; font-weight: 500; font-size: 13px;">${room.area} m²</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background: #1a1a1a; padding: 12px 40px; text-align: center; margin-top: auto;">
          <span style="color: #999; font-size: 10px;">unity.ge</span>
        </div>
      </div>
    `
    
    document.body.appendChild(container)
    
    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Render first page with text content
    const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * pageWidth) / canvas.width
    
    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight))
    
    // Clean up
    document.body.removeChild(container)
    
    // Helper function to convert storage URL to API proxy URL
    const getProxyImageUrl = (originalUrl: string): string => {
      // Extract path from storage URL (e.g., /storage/images/apartments/2025/12/xxx.png)
      const match = originalUrl.match(/\/storage\/(.+)$/)
      if (match) {
        // Use API proxy: /api/images/{path}
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        return `${apiBase}/api/images/${match[1]}`
      }
      return originalUrl
    }
    
    // Helper function to load and add image to PDF
    const addImagePage = async (imageUrl: string, label: string) => {
      try {
        // Use proxy URL to avoid CORS issues
        const proxyUrl = getProxyImageUrl(imageUrl)
        
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Failed to load image'))
          img.src = proxyUrl
        })
        
        // Add new page
        doc.addPage()
        
        // Header bar
        doc.setFillColor(255, 205, 75)
        doc.rect(0, 0, pageWidth, 20, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`${label} - N.${apt.apartment_number}`, 10, 13)
        
        // Calculate image dimensions
        const margin = 10
        const maxImgWidth = pageWidth - 2 * margin
        const maxImgHeight = pageHeight - 40
        
        let imgWidth = img.width
        let imgHeight = img.height
        
        const scale = Math.min(maxImgWidth / imgWidth, maxImgHeight / imgHeight)
        imgWidth *= scale
        imgHeight *= scale
        
        const imgX = (pageWidth - imgWidth) / 2
        const imgY = 25
        
        doc.addImage(img, 'PNG', imgX, imgY, imgWidth, imgHeight)
        
        // Footer
        doc.setFillColor(40, 40, 40)
        doc.rect(0, pageHeight - 10, pageWidth, 10, 'F')
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text('unity.ge', pageWidth / 2, pageHeight - 4, { align: 'center' })
        
        return true
      } catch (error) {
        console.warn(`Could not add ${label} image to PDF:`, error)
        return false
      }
    }
    
    
    // Add 2D image if available (using English title since jsPDF doesn't support Georgian)
    if (apt.image_2d?.url) {
      await addImagePage(apt.image_2d.url, '2D Floor Plan')
    }
    
    // Add 3D image if available
    if (apt.image_3d?.url) {
      await addImagePage(apt.image_3d.url, '3D Render')
    }
    
    // If no 2D/3D but has floor plan, add that
    if (!apt.image_2d?.url && !apt.image_3d?.url && apt.floor_plan_image) {
      await addImagePage(apt.floor_plan_image, 'Floor Plan')
    }
    
    // Save
    doc.save(`apartment-${apt.apartment_number}.pdf`)
    
    toastStore.success(
      t('apartments.pdf_generated') || 'PDF Generated',
      t('apartments.pdf_download_started') || 'Download started'
    )
  } catch (error) {
    console.error('PDF generation failed:', error)
    toastStore.error(
      t('messages.error_title') || 'Error',
      t('apartments.pdf_error') || 'Failed to generate PDF'
    )
  } finally {
    isGeneratingPDF.value = false
  }
}
</script>

<style scoped>
/* Lightbox transitions */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: all 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}


.lightbox-enter-from img,
.lightbox-leave-to img {
  transform: scale(0.9);
}


/* View Switch Transitions */

/* Slide Left (Going to 3D) */
.view-slide-left-enter-active,
.view-slide-left-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.view-slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
.view-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%) scale(0.9);
}

/* Slide Right (Going back to 2D) */
.view-slide-right-enter-active,
.view-slide-right-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.view-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100%) scale(0.9);
}
.view-slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Fade Fallback */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.3s ease;
}
.view-fade-enter-from,
.view-fade-leave-to {
  opacity: 0;
}
</style>
