<template>
  <section v-if="projects.length > 0" class="py-20 bg-white">
    <div ref="element" class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <div
        class="text-center mb-12 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'opacity-100 translate-y-0': isVisible,
          'opacity-0 translate-y-8': !isVisible,
        }"
      >
        <h2 class="text-4xl font-light text-zinc-900 mb-4">
          {{ t('projects.related.title') }}
        </h2>
        <div
          class="w-20 h-0.5 bg-[#FFCD4B] mx-auto transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-center"
          :class="{
            'scale-x-100': isVisible,
            'scale-x-0': !isVisible,
          }"
        ></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(relatedProject, index) in projects"
          :key="relatedProject.id"
          @click="$emit('navigate', relatedProject.id)"
          class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30 cursor-pointer"
          :class="{
            'opacity-100 translate-y-0 scale-100 blur-0': isVisible,
            'opacity-0 translate-y-12 scale-95 blur-sm': !isVisible,
          }"
          :style="{ transitionDelay: `${index * 80}ms` }"
        >
          <div class="relative h-64 bg-zinc-100 overflow-hidden">
            <img
              v-if="relatedProject.main_image"
              :src="relatedProject.main_image.url"
              :alt="relatedProject.main_image.alt_text || relatedProject.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
            />

            <!-- Gradient overlay on hover -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>

            <!-- Golden accent line on hover -->
            <div
              class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
            ></div>
          </div>

          <div class="p-6 bg-white relative overflow-hidden">
            <!-- Subtle background accent -->
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>

            <h3
              class="text-xl font-light text-zinc-900 mb-2 group-hover:text-[#C89116] transition-colors relative z-10"
            >
              {{ relatedProject.title }}
            </h3>
            <span class="text-sm text-zinc-500 font-light relative z-10">
              {{ getStatusText(relatedProject.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import { useTranslations } from '@/composables/i18n/useTranslations'

interface RelatedProjectItem {
  id: number
  title: string
  status: string
  main_image?: {
    url: string
    alt_text?: string | null
  } | null
}

const { t } = useTranslations()

defineProps<{
  projects: RelatedProjectItem[]
}>()

defineEmits<{
  (e: 'navigate', id: number): void
}>()

const { element, isVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return t('projects.status.completed')
    case 'ongoing':
      return t('projects.status.ongoing')
    case 'planning':
      return t('projects.status.planning')
    default:
      return status
  }
}
</script>
