<template>
  <section v-if="features.length > 0" class="py-20 bg-zinc-50">
    <div ref="element" class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <div
        class="text-center mb-12 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'opacity-100 translate-y-0': isVisible,
          'opacity-0 translate-y-8': !isVisible,
        }"
      >
        <h2 class="text-4xl font-light text-zinc-900 mb-4">
          {{ t('projects.advantages.title') }}
        </h2>
        <div
          class="w-20 h-0.5 bg-[#FFCD4B] mx-auto transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-center"
          :class="{
            'scale-x-100': isVisible,
            'scale-x-0': !isVisible,
          }"
        ></div>
      </div>

      <!-- Dynamic Feature Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(feature, index) in features"
          :key="feature.id"
          class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30 p-6 relative"
          :class="{
            'opacity-100 translate-y-0 scale-100 blur-0': isVisible,
            'opacity-0 translate-y-12 scale-95 blur-sm': !isVisible,
          }"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <!-- Subtle background accent on hover -->
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          ></div>

          <!-- Feature Icon -->
          <div
            class="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10"
          >
            <span class="text-2xl">{{ feature.icon }}</span>
          </div>

          <!-- Feature Content -->
          <div class="relative z-10">
            <h3
              class="text-xl font-light text-zinc-900 mb-2 group-hover:text-[#C89116] transition-colors"
            >
              {{ feature.title }}
            </h3>
            <p class="text-zinc-600 leading-relaxed font-light">
              {{ feature.description }}
            </p>
          </div>

          <!-- Golden accent line on hover -->
          <div
            class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { ProjectFeature } from '@/services/featuresApi'

const { t } = useTranslations()

defineProps<{
  features: ProjectFeature[]
}>()

const { element, isVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
</script>
