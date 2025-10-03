<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { RouterLink } from 'vue-router'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const { t } = useTranslations()

const companyNameParts = computed(() => {
  const companyName = t('home.company_name')
  // Only split if we have a valid translation (not the key itself)
  return companyName && companyName !== 'home.company_name' ? companyName.split(' ') : []
})

// Scroll animations for different sections
const { element: companyElement, isVisible: companyVisible } = useScrollAnimation({
  threshold: 0.3,
})
const { element: whoWeAreElement, isVisible: whoWeAreVisible } = useScrollAnimation({
  threshold: 0.3,
  delay: 200,
})
const { element: historyElement, isVisible: historyVisible } = useScrollAnimation({
  threshold: 0.3,
  delay: 400,
})
</script>

<template>
  <!-- About Section -->
  <section class="bg-white py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
      <!-- Company Name with fade-in animation -->
      <div
        ref="companyElement"
        class="mb-12 sm:mb-14 md:mb-16 transition-all duration-1000 transform"
        :class="companyVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'"
      >
        <div class="w-16 sm:w-20 h-0.5 bg-gradient-to-r from-[#FFCD4B] to-[#EBB738] mb-6 sm:mb-8 transition-all duration-1000"
          :class="companyVisible ? 'scale-x-100' : 'scale-x-0'"
          style="transform-origin: left"
        ></div>
        <h1 class="text-zinc-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight leading-tight mb-2">
          {{ companyNameParts[0] }}
        </h1>
        <h2 class="text-[#FFCD4B] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight mb-6 sm:mb-8">
          {{ companyNameParts[1] }}
        </h2>
        <p class="text-zinc-600 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-4 sm:mb-6">
          {{ t('home.small_desc') }}
        </p>
        <RouterLink
          to="/about"
          class="inline-flex items-center gap-2 text-[#C89116] text-xs sm:text-sm font-light uppercase tracking-[2px] sm:tracking-[3px] hover:text-[#FFCD4B] transition-colors"
        >
          <span>{{ t('buttons.see_details') }}</span>
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </RouterLink>
      </div>

      <!-- Who We Are Section with fade-in -->
      <div
        ref="whoWeAreElement"
        class="mb-12 sm:mb-14 md:mb-16 transition-all duration-1000 transform"
        :class="whoWeAreVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <h3 class="text-zinc-900 text-xl sm:text-2xl md:text-3xl font-light uppercase tracking-wider mb-4 sm:mb-6">
          {{ t('home.whoarewe') }}
        </h3>
        <div class="w-12 sm:w-14 md:w-16 h-0.5 bg-[#FFCD4B] mb-4 sm:mb-6"></div>
        <p class="text-zinc-700 text-base sm:text-lg font-light leading-relaxed max-w-2xl">
          {{ t('home.description') }}
        </p>
      </div>

      <!-- History Section with fade-in -->
      <div
        ref="historyElement"
        class="transition-all duration-1000 transform"
        :class="historyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <h4 class="text-zinc-900 text-xl sm:text-2xl md:text-3xl font-light uppercase tracking-wider mb-4 sm:mb-6">
          {{ t('home.history') }}
        </h4>
        <div class="w-12 sm:w-14 md:w-16 h-0.5 bg-[#FFCD4B] mb-4 sm:mb-6"></div>
        <p class="text-zinc-700 text-base sm:text-lg font-light leading-relaxed max-w-2xl">
          {{ t('home.history_text') }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
