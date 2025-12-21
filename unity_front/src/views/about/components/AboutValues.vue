<script setup lang="ts">
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import { useTranslations } from '@/composables/useTranslations'

defineProps<{
  values: { title: string; description: string }[]
}>()

const { t } = useTranslations()
const { element: valuesSectionRef, isVisible: valuesSectionVisible } = useScrollAnimation({
  once: true,
  threshold: 0.05,
  rootMargin: '200px',
})
</script>

<template>
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
</template>
