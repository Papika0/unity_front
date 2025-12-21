<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

defineProps<{
  heroVisible: boolean
}>()

const { t } = useTranslations()
</script>

<template>
  <section class="relative h-[45vh] min-h-[350px] overflow-hidden bg-black">
    <div
      class="absolute inset-0 bg-gradient-to-br from-[#FFCD4B]/10 via-transparent to-transparent transition-opacity duration-1000 delay-200"
      :class="{ 'opacity-100': heroVisible, 'opacity-0': !heroVisible }"
    ></div>

    <!-- Decorative corners -->
    <div
      class="absolute top-0 right-0 w-64 h-64 opacity-20 transition-all duration-1000 delay-300"
      :class="{
        'opacity-20 translate-x-0 translate-y-0': heroVisible,
        'opacity-0 translate-x-8 -translate-y-8': !heroVisible,
      }"
    >
      <div class="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#FFCD4B]"></div>
    </div>
    <div
      class="absolute bottom-0 left-0 w-64 h-64 opacity-20 transition-all duration-1000 delay-400"
      :class="{
        'opacity-20 translate-x-0 translate-y-0': heroVisible,
        'opacity-0 -translate-x-8 translate-y-8': !heroVisible,
      }"
    >
      <div class="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#FFCD4B]"></div>
    </div>

    <div class="relative z-10 h-full flex flex-col justify-center">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 w-full">
        <div
          class="max-w-3xl transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
          :class="{
            'opacity-100 translate-y-0 blur-0': heroVisible,
            'opacity-0 translate-y-12 blur-sm': !heroVisible,
          }"
        >
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight text-white">
            {{ t('projects.title') }}
          </h1>
          <div
            class="w-20 h-1 bg-gradient-to-r from-[#FFCD4B] to-transparent mb-6 transition-all duration-1000 delay-300"
            :class="{ 'scale-x-100': heroVisible, 'scale-x-0': !heroVisible }"
            style="transform-origin: left"
          ></div>
          <p class="text-lg md:text-xl text-[#FFCD4B] font-light leading-relaxed max-w-2xl">
            {{ t('projects.subtitle') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
