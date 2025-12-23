<script setup lang="ts">
import { useAbout } from './about/composables'
import { AboutStats, AboutValues, AboutMission, AboutCta } from './about/components'

const {
  t,
  aboutInfo,
  isLoading,
  error,
  loadAboutInfo,
  stats,
  values,
  heroVisible,
  philosophyTextRef,
  philosophyTextVisible,
  philosophyImageRef,
  philosophyImageVisible,
  scrollProgress,
} = useAbout()
</script>

<template>
  <div class="about-page">
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,205,75,0.5)]"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="fixed top-16 right-8 z-50 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-[#FFCD4B]/30"
    >
      <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-[#FFCD4B]"></div>
        <span class="text-sm text-[#FFCD4B] font-light uppercase tracking-wider">
          {{ t('about.loading') }}
        </span>
      </div>
    </div>

    <!-- Error Toast -->
    <div
      v-if="error"
      class="fixed top-16 right-8 z-50 bg-red-500/90 backdrop-blur-sm px-6 py-4 rounded border border-red-400 max-w-md"
    >
      <div class="flex items-start gap-3">
        <div class="text-2xl">⚠️</div>
        <div class="flex-1">
          <h3 class="text-white font-medium mb-1">{{ t('about.error') }}</h3>
          <p class="text-white/90 text-sm">{{ error }}</p>
          <button
            @click="loadAboutInfo()"
            class="mt-2 px-4 py-1 bg-white/20 hover:bg-white/30 text-white text-xs uppercase tracking-wider transition-all duration-300 rounded"
          >
            {{ t('about.retry') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-[#FFCD4B]/10 via-transparent to-transparent transition-opacity duration-1000 delay-200"
        :class="{ 'opacity-100': heroVisible, 'opacity-0': !heroVisible }"
      ></div>

      <!-- Decorative corners -->
      <div
        class="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 opacity-20 transition-all duration-1000 delay-300"
        :class="{
          'opacity-20 translate-x-0 translate-y-0': heroVisible,
          'opacity-0 translate-x-8 -translate-y-8': !heroVisible,
        }"
      >
        <div class="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-t-2 border-r-2 border-[#FFCD4B]"></div>
      </div>
      <div
        class="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 opacity-20 transition-all duration-1000 delay-400"
        :class="{
          'opacity-20 translate-x-0 translate-y-0': heroVisible,
          'opacity-0 -translate-x-8 translate-y-8': !heroVisible,
        }"
      >
        <div class="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-b-2 border-l-2 border-[#FFCD4B]"></div>
      </div>

      <div class="relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-32 text-center">
          <div
            class="max-w-3xl mx-auto transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
            :class="{
              'opacity-100 translate-y-0 blur-0': heroVisible,
              'opacity-0 translate-y-12 blur-sm': !heroVisible,
            }"
          >
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 sm:mb-6 leading-tight text-white">
              {{ t('about.title') }}
            </h1>
            <div
              class="w-16 sm:w-20 h-1 bg-gradient-to-r from-transparent via-[#FFCD4B] to-transparent mx-auto mb-4 sm:mb-6 transition-all duration-1000 delay-300"
              :class="{ 'scale-x-100': heroVisible, 'scale-x-0': !heroVisible }"
            ></div>
            <p class="text-base sm:text-lg md:text-xl text-[#FFCD4B] font-light leading-relaxed max-w-2xl mx-auto text-justify">
              {{ t('about.hero.subtitle') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Philosophy Section -->
    <section class="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-32">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-24 items-center">
          <div
            ref="philosophyTextRef"
            class="order-2 lg:order-1 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="{
              'opacity-100 translate-x-0 blur-0': philosophyTextVisible,
              'opacity-0 -translate-x-12 blur-sm': !philosophyTextVisible,
            }"
          >
            <div class="space-y-6 sm:space-y-8">
              <div>
                <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-6 sm:mb-8 text-zinc-900">
                  {{ t('about.philosophy.title') }}
                </h2>
                <div
                  class="w-16 sm:w-20 h-0.5 bg-[#FFCD4B] mb-4 sm:mb-6 transition-all duration-1000 delay-200"
                  :class="{ 'scale-x-100': philosophyTextVisible, 'scale-x-0': !philosophyTextVisible }"
                  style="transform-origin: left"
                ></div>
              </div>
              <div class="space-y-4 sm:space-y-6 text-base sm:text-lg text-zinc-700 leading-relaxed font-light">
                <p>{{ t('about.philosophy.paragraph1') }}</p>
                <p>{{ t('about.philosophy.paragraph2') }}</p>
                <p>{{ t('about.philosophy.paragraph3') }}</p>
              </div>
            </div>
          </div>

          <div
            ref="philosophyImageRef"
            class="order-1 lg:order-2 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="{
              'opacity-100 translate-x-0 scale-100 blur-0': philosophyImageVisible,
              'opacity-0 translate-x-12 scale-95 blur-sm': !philosophyImageVisible,
            }"
          >
            <div class="group aspect-[4/5] bg-zinc-100 overflow-hidden hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 relative">
              <img
                v-if="aboutInfo?.philosophy_image_url"
                :src="aboutInfo.philosophy_image_url"
                :alt="t('about.philosophy.image_alt')"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-24 h-24 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section (Component) -->
    <AboutStats :stats="stats" />

    <!-- Values Section (Component) -->
    <AboutValues :values="values" />

    <!-- Mission Section (Component) -->
    <AboutMission />

    <!-- CTA Section (Component) -->
    <AboutCta />
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #18181b;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #ffcd4b, #ebb738, #c89116);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ebb738, #c89116, #a37814);
}

::selection {
  background: #ffcd4b;
  color: #000;
}

::-moz-selection {
  background: #ffcd4b;
  color: #000;
}
</style>
