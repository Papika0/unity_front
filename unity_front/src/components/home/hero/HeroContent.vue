<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'
import type { Project } from '@/stores/public/projects'

interface Props {
  project: Project
  index: number
  currentSlide: number
  previousSlide: number | null
  slideDirection: 'next' | 'prev'
  hasInitiallyLoaded: boolean
  scrollProgress: number
}

defineProps<Props>()
const { t } = useTranslations()
</script>

<template>
  <!-- Hero Content -->
  <div
    class="absolute inset-0 flex items-end pb-12 sm:pb-16 md:pb-20 lg:pb-24 xl:pb-32 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 transition-all duration-300"
    :style="`
      opacity: ${1 - (scrollProgress * 1.2)};
      transform: translateY(${scrollProgress * 30}px);
    `"
  >
    <div class="max-w-7xl mx-auto w-full">
      <div
        class="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'translate-y-0 opacity-100 translate-x-0': index === currentSlide && hasInitiallyLoaded,
          'translate-y-12 opacity-0 translate-x-12': index !== currentSlide && index === previousSlide && slideDirection === 'next',
          'translate-y-12 opacity-0 -translate-x-12': index !== currentSlide && index === previousSlide && slideDirection === 'prev',
          'translate-y-12 opacity-0': index !== currentSlide && index !== previousSlide || !hasInitiallyLoaded,
        }"
      >
        <!-- Location with Golden Accent -->
        <div
          class="flex items-center space-x-2 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
          :class="{
            'translate-x-0 opacity-100 blur-0 scale-100': index === currentSlide && hasInitiallyLoaded,
            'translate-x-[-60px] opacity-0 blur-sm scale-95': (index !== currentSlide || !hasInitiallyLoaded) && slideDirection === 'next',
            'translate-x-[60px] opacity-0 blur-sm scale-95': (index !== currentSlide || !hasInitiallyLoaded) && slideDirection === 'prev',
          }"
        >
          <div class="w-8 sm:w-10 md:w-12 h-[1px] bg-gradient-to-r from-[#FFCD4B] to-[#EBB738] shadow-[0_0_10px_rgba(255,205,75,0.5)]"></div>
          <p class="text-[#FFCD4B] text-xs sm:text-sm font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase drop-shadow-[0_2px_10px_rgba(255,205,75,0.3)]">
            {{ project.location }}
          </p>
        </div>

        <!-- Title with Luxury Typography -->
        <h1
          class="text-white font-thin tracking-tight transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200"
          style="text-shadow: 0 4px 30px rgba(0,0,0,0.8);"
          :class="{
            'translate-x-0 opacity-100 blur-0 scale-100': index === currentSlide && hasInitiallyLoaded,
            'translate-x-[-70px] opacity-0 blur-sm scale-95': (index !== currentSlide || !hasInitiallyLoaded) && slideDirection === 'next',
            'translate-x-[70px] opacity-0 blur-sm scale-95': (index !== currentSlide || !hasInitiallyLoaded) && slideDirection === 'prev',
          }"
        >
          <span class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl block leading-none">
            {{ project.title }}
          </span>
        </h1>

        <!-- Refined Action Button -->
        <div
          class="pt-4 sm:pt-6 md:pt-8 transition-all duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-400"
          :class="{
            'translate-y-0 opacity-100 scale-100 blur-0': index === currentSlide && hasInitiallyLoaded,
            'translate-y-12 opacity-0 scale-90 blur-sm': index !== currentSlide || !hasInitiallyLoaded,
          }"
        >
          <router-link
            :to="`/projects/${project.id}`"
            class="group relative inline-block px-6 sm:px-8 md:px-10 lg:px-12 py-2.5 sm:py-3 md:py-3.5 lg:py-4 overflow-hidden transition-all duration-500 hover:scale-105"
          >
            <span
              class="relative z-10 text-[#FFCD4B] text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] uppercase font-light drop-shadow-[0_2px_10px_rgba(255,205,75,0.4)]"
            >
              {{ t('buttons.see_details') }}
            </span>
            <div
              class="absolute inset-0 border border-[#FFCD4B]/30 transition-all duration-500 group-hover:border-[#FFCD4B]/80 group-hover:shadow-[0_0_20px_rgba(255,205,75,0.3)]"
            ></div>
            <div
              class="absolute inset-0 bg-[#FFCD4B]/0 transition-all duration-500 group-hover:bg-[#FFCD4B]/10"
            ></div>
            <svg
              class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-[#FFCD4B] transition-transform duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Typography refinements */
h1 {
  font-weight: 100;
  letter-spacing: -0.02em;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  h1 span {
    font-size: 2rem;
    line-height: 1.1;
  }
}

@media (min-width: 641px) and (max-width: 767px) {
  h1 span {
    font-size: 2.5rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  h1 span {
    font-size: 3.5rem;
  }
}
</style>
