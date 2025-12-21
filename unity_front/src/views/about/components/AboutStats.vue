<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import { useTranslations } from '@/composables/i18n/useTranslations'

defineProps<{
  stats: { number: string; label: string }[]
}>()

const { t } = useTranslations()
const { element: statsSectionRef, isVisible: statsSectionVisible } = useScrollAnimation({
  once: true,
  threshold: 0.05,
  rootMargin: '200px',
})
</script>

<template>
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
</template>
