<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()
const { element: ctaSectionRef, isVisible: ctaVisible } = useScrollAnimation({
  once: true,
  threshold: 0.05,
  rootMargin: '200px',
})
</script>

<template>
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
</template>
