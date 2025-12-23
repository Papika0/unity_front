<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'

defineProps<{
  t: (key: string) => string
}>()

const emit = defineEmits<{
  scrollToForm: []
}>()

// Component manages its own scroll animation
const { element: ctaElement, isVisible: ctaVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <section ref="ctaElement" class="relative py-20 bg-black">
    <!-- Diagonal gradient overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-[#FFCD4B]/10 via-transparent to-transparent opacity-50"
    ></div>

    <div class="relative container mx-auto px-6 lg:px-12 xl:px-20 text-center">
      <div class="max-w-3xl mx-auto transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'opacity-100 translate-y-0 scale-100 blur-0': ctaVisible,
          'opacity-0 translate-y-12 scale-95 blur-sm': !ctaVisible,
        }"
      >
        <h2 class="text-3xl lg:text-4xl font-extralight text-white mb-6 leading-tight transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
          :class="{
            'opacity-100 translate-y-0': ctaVisible,
            'opacity-0 translate-y-8': !ctaVisible,
          }"
        >
          {{ t('contact.cta.title.part1') }}
          <span class="text-[#FFCD4B]">{{ t('contact.cta.title.part2') }}</span>
        </h2>
        <p class="text-lg text-zinc-400 font-light leading-relaxed mb-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200"
          :class="{
            'opacity-100 translate-y-0': ctaVisible,
            'opacity-0 translate-y-8': !ctaVisible,
          }"
        >
          {{ t('contact.cta.subtitle') }}
        </p>

        <!-- Simple CTA button -->
        <button
          @click="emit('scrollToForm')"
          class="inline-flex items-center gap-3 px-10 py-4 bg-[#FFCD4B]/10 border border-[#FFCD4B]/30 text-[#FFCD4B] hover:bg-[#FFCD4B]/20 font-light tracking-wider uppercase text-sm transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer delay-300"
          :class="{
            'opacity-100 scale-100': ctaVisible,
            'opacity-0 scale-90': !ctaVisible,
          }"
        >
          <span>{{ t('contact.cta.button') }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>
