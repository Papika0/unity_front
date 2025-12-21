<template>
  <section ref="element" class="relative h-[65vh] min-h-[500px] overflow-hidden bg-black">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0">
      <img
        v-if="project.render_image || project.main_image"
        :src="(project.render_image?.url || project.main_image?.url)!"
        :alt="(project.render_image?.alt_text || project.main_image?.alt_text || project.title)"
        class="w-full h-full object-cover opacity-40"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
    </div>

    <!-- Subtle geometric pattern with parallax effect -->
    <div class="absolute inset-0 opacity-5">
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-[#FFCD4B] rounded-full blur-3xl animate-float"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-96 h-96 bg-[#FFCD4B] rounded-full blur-3xl animate-float-delayed"
      ></div>
    </div>

    <!-- Decorative lines -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFCD4B]/20 to-transparent"
      ></div>
      <div
        class="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFCD4B]/20 to-transparent"
      ></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 h-full flex flex-col">
      <!-- Navigation -->
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 w-full pt-8">
        <button
          @click="$emit('back')"
          class="text-white/90 hover:text-[#FFCD4B] flex items-center gap-2 group transition-all duration-300 bg-white/5 backdrop-blur-sm px-5 py-2.5 border border-white/10 hover:border-[#FFCD4B]/30 transform hover:scale-105"
        >
          <svg
            class="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span class="font-light uppercase tracking-wider text-sm">{{ t('buttons.back') }}</span>
        </button>
      </div>

      <!-- Hero Content -->
      <div class="flex-grow flex items-center">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 w-full">
          <div
            class="max-w-4xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="{
              'opacity-100 translate-y-0 scale-100 blur-0': isVisible,
              'opacity-0 translate-y-12 scale-95 blur-sm': !isVisible,
            }"
          >
            <!-- Status Badge -->
            <div
              class="mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
              :class="{
                'opacity-100 translate-x-0': isVisible,
                'opacity-0 -translate-x-8': !isVisible,
              }"
            >
              <span
                class="px-3 py-1 text-xs font-light uppercase tracking-wider backdrop-blur-sm"
                :class="statusColor"
              >
                {{ statusText }}
              </span>
            </div>

            <!-- Title -->
            <h1
              class="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-8 tracking-wide leading-tight transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200"
              :class="{
                'opacity-100 translate-y-0': isVisible,
                'opacity-0 translate-y-8': !isVisible,
              }"
            >
              {{ project.title }}
            </h1>

            <div
              class="w-20 h-0.5 bg-[#FFCD4B] mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-300 origin-left"
              :class="{
                'scale-x-100': isVisible,
                'scale-x-0': !isVisible,
              }"
            ></div>

            <!-- Location and Year -->
            <div
              class="flex flex-wrap items-center gap-8 text-white/80 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-400"
              :class="{
                'opacity-100 translate-y-0': isVisible,
                'opacity-0 translate-y-8': !isVisible,
              }"
            >
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[#FFCD4B]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-base font-light">{{ project.location }}</span>
              </div>
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[#FFCD4B]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-base font-light">{{ project.year }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { ProjectApiResponse } from '@/services/projectsApi'

const { t } = useTranslations()

defineProps<{
  project: ProjectApiResponse
  statusText: string
  statusColor: string
}>()

defineEmits<{
  (e: 'back'): void
}>()

const { element, isVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
</script>

<style scoped>
/* Animations */
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

@keyframes floatDelayed {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-20px, 20px); }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: floatDelayed 10s ease-in-out infinite;
}
</style>
