<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()
const { element: missionSectionRef, isVisible: missionVisible } = useScrollAnimation({
  once: true,
  threshold: 0.05,
  rootMargin: '200px',
})
</script>

<template>
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
</template>
