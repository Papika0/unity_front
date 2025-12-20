<script setup lang="ts">
import { useAbout } from './about/composables'

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
  statsSectionRef,
  statsSectionVisible,
  valuesSectionRef,
  valuesSectionVisible,
  missionSectionRef,
  missionVisible,
  ctaSectionRef,
  ctaVisible,
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

    <!-- Stats Section -->
    <section ref="statsSectionRef" class="py-12 sm:py-16 md:py-20 bg-zinc-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-32">
        <div
          class="text-center mb-10 sm:mb-12 md:mb-16 transition-all duration-1000 ease-out"
          :class="{
            'opacity-100 translate-y-0 blur-0': statsSectionVisible,
            'opacity-0 translate-y-8 blur-sm': !statsSectionVisible,
          }"
        >
          <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-zinc-900">
            {{ t('about.stats.title') }}
          </h2>
          <div
            class="w-16 sm:w-20 h-0.5 bg-[#FFCD4B] mx-auto transition-all duration-1000 delay-200"
            :class="{ 'scale-x-100': statsSectionVisible, 'scale-x-0': !statsSectionVisible }"
          ></div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          <div
            v-for="(stat, index) in stats"
            :key="stat.label"
            class="text-center group transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="{
              'opacity-100 translate-y-0 scale-100 blur-0': statsSectionVisible,
              'opacity-0 translate-y-12 scale-90 blur-sm': !statsSectionVisible,
            }"
            :style="{ transitionDelay: `${(index + 2) * 150}ms` }"
          >
            <div class="bg-white p-4 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10">
                <div class="text-3xl sm:text-4xl lg:text-5xl font-light mb-2 transition-all duration-500 group-hover:scale-110 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] bg-clip-text text-transparent">
                  {{ stat.number }}
                </div>
                <div class="text-zinc-700 font-light text-xs sm:text-sm md:text-base">
                  {{ stat.label }}
                </div>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section ref="valuesSectionRef" class="py-20 lg:py-32 bg-white">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div
          class="text-center mb-20 transition-all duration-1000 ease-out"
          :class="{
            'opacity-100 translate-y-0 blur-0': valuesSectionVisible,
            'opacity-0 translate-y-8 blur-sm': !valuesSectionVisible,
          }"
        >
          <h2 class="text-4xl lg:text-5xl font-light mb-6 text-zinc-900">
            {{ t('about.values.title') }}
          </h2>
          <div
            class="w-20 h-0.5 bg-[#FFCD4B] mx-auto mb-6 transition-all duration-1000 delay-200"
            :class="{ 'scale-x-100': valuesSectionVisible, 'scale-x-0': !valuesSectionVisible }"
          ></div>
          <p class="text-xl text-zinc-700 font-light max-w-3xl mx-auto leading-relaxed">
            {{ t('about.values.subtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div
            v-for="(value, index) in values"
            :key="value.title"
            class="group transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="{
              'opacity-100 translate-y-0 scale-100 blur-0': valuesSectionVisible,
              'opacity-0 translate-y-12 scale-95 blur-sm': !valuesSectionVisible,
            }"
            :style="{ transitionDelay: `${(index + 3) * 150}ms` }"
          >
            <div class="bg-white p-8 lg:p-10 hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 relative overflow-hidden h-full">
              <div class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10">
                <div class="w-12 h-12 rounded-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <h3 class="text-2xl lg:text-3xl font-light mb-4 text-zinc-900 group-hover:text-[#C89116] transition-colors duration-300">
                  {{ value.title }}
                </h3>
                <p class="text-lg text-zinc-700 font-light leading-relaxed">
                  {{ value.description }}
                </p>
              </div>
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section ref="missionSectionRef" class="relative py-16 lg:py-20 bg-black text-white overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-tl from-[#FFCD4B]/10 via-transparent to-transparent transition-opacity duration-1000"
        :class="{ 'opacity-100': missionVisible, 'opacity-0': !missionVisible }"
      ></div>
      <div
        class="absolute top-0 left-0 w-64 h-64 opacity-20 transition-all duration-1000 delay-200"
        :class="{
          'opacity-20 translate-x-0 translate-y-0': missionVisible,
          'opacity-0 -translate-x-8 -translate-y-8': !missionVisible,
        }"
      >
        <div class="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#FFCD4B]"></div>
      </div>
      <div
        class="absolute bottom-0 right-0 w-64 h-64 opacity-20 transition-all duration-1000 delay-300"
        :class="{
          'opacity-20 translate-x-0 translate-y-0': missionVisible,
          'opacity-0 translate-x-8 translate-y-8': !missionVisible,
        }"
      >
        <div class="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#FFCD4B]"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-center">
        <div
          class="transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-y-0 blur-0': missionVisible,
            'opacity-0 translate-y-12 blur-sm': !missionVisible,
          }"
        >
          <h2 class="text-3xl lg:text-4xl font-light mb-6 leading-tight text-white">
            {{ t('about.mission.title') }}
          </h2>
          <div
            class="w-20 h-1 bg-gradient-to-r from-transparent via-[#FFCD4B] to-transparent mx-auto mb-8 transition-all duration-1000 delay-200"
            :class="{ 'scale-x-100': missionVisible, 'scale-x-0': !missionVisible }"
          ></div>
          <p class="text-lg lg:text-xl font-light leading-relaxed text-white/90 mb-8">
            {{ t('about.mission.description') }}
          </p>
          <router-link
            to="/projects"
            class="inline-flex items-center gap-3 px-10 py-4 bg-[#FFCD4B]/10 border border-[#FFCD4B]/30 text-[#FFCD4B] text-sm uppercase tracking-wider font-light transition-all duration-500 hover:bg-[#FFCD4B]/20 hover:border-[#FFCD4B]/50 group"
          >
            <span>{{ t('header.projects') }}</span>
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section ref="ctaSectionRef" class="bg-zinc-50 py-20">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 text-center">
        <div
          class="transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-y-0 scale-100 blur-0': ctaVisible,
            'opacity-0 translate-y-12 scale-95 blur-sm': !ctaVisible,
          }"
        >
          <h2 class="text-3xl md:text-4xl font-light mb-4 text-zinc-800">
            {{ t('about.cta.title') }}
          </h2>
          <p class="text-lg text-zinc-600 mb-8 max-w-2xl mx-auto font-light">
            {{ t('about.cta.description') }}
          </p>
          <router-link
            to="/contact"
            class="inline-flex items-center gap-3 px-10 py-4 bg-black text-[#FFCD4B] text-sm uppercase tracking-wider font-light transition-all duration-500 hover:bg-zinc-900 group hover:shadow-lg"
          >
            <span>{{ t('contact.title') }}</span>
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </router-link>
        </div>
      </div>
    </section>
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
