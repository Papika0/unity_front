<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'

defineProps<{
  scrollProgress: number
  t: (key: string) => string
}>()

// Component manages its own scroll animation
const { element: heroElement, isVisible: heroVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <!-- Scroll Progress Bar -->
  <div class="fixed top-0 left-0 w-full h-1 bg-black/5 z-[100]">
    <div
      class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-300 shadow-[0_0_15px_rgba(255,205,75,0.6)]"
      :style="{ width: scrollProgress + '%' }"
    ></div>
  </div>

  <!-- Hero Section - Compact with corner frames -->
  <section ref="heroElement" class="relative h-[45vh] min-h-[350px] overflow-hidden bg-black">
    <!-- Diagonal gradient overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-[#FFCD4B]/10 via-transparent to-transparent"
    ></div>

    <!-- Decorative corner frames -->
    <div class="absolute top-0 right-0 w-64 h-64 opacity-20 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="{
        'translate-x-0 translate-y-0': heroVisible,
        'translate-x-12 -translate-y-12': !heroVisible,
      }"
    >
      <div class="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#FFCD4B]"></div>
    </div>
    <div class="absolute bottom-0 left-0 w-64 h-64 opacity-20 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="{
        'translate-x-0 translate-y-0': heroVisible,
        '-translate-x-12 translate-y-12': !heroVisible,
      }"
    >
      <div
        class="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#FFCD4B]"
      ></div>
    </div>

    <div class="relative z-10 h-full flex items-center justify-center">
      <div class="container mx-auto px-6 lg:px-12 xl:px-20 text-center">
        <div class="max-w-4xl mx-auto transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-y-0 scale-100 blur-0': heroVisible,
            'opacity-0 translate-y-12 scale-95 blur-sm': !heroVisible,
          }"
        >
          <h1
            class="text-5xl md:text-6xl lg:text-7xl font-extralight text-white mb-6 tracking-tight transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
            :class="{
              'opacity-100 translate-y-0': heroVisible,
              'opacity-0 translate-y-8': !heroVisible,
            }"
          >
            {{ t('contact.title') }}
          </h1>

          <p
            class="text-lg md:text-xl text-[#FFCD4B] font-light leading-relaxed transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200"
            :class="{
              'opacity-100 translate-y-0': heroVisible,
              'opacity-0 translate-y-8': !heroVisible,
            }"
          >
            {{ t('contact.hero.subtitle') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
