<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { useProjectsStore, type Project } from '@/stores/public/projects'
import { getImageUrl } from '@/utils/imageUrl'

const { t } = useTranslations()
const projectsStore = useProjectsStore()

// Get the first featured project or fallback to first active project
const featuredProject = computed((): Project | null => {
  // Handle both array and single object cases
  const data = projectsStore.aloneProjectsData as Project[] | Project | null | undefined

  // If it's an array, get the first item
  if (Array.isArray(data) && data.length > 0) {
    return data[0]
  }

  // If it's a single object with id property, return it
  if (data && typeof data === 'object' && 'id' in data) {
    return data
  }

  // Otherwise return null
  return null
})
</script>

<template>
  <!-- Featured Project -->
  <section v-if="featuredProject" class="bg-black">
    <div class="w-full">
      <div class="relative">
        <img
          :src="getImageUrl(featuredProject.main_image) || 'https://placehold.co/900x806'"
          :alt="featuredProject.title"
          class="w-full h-[800px] object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>

        <div class="absolute inset-0 flex flex-col justify-center items-center text-center px-8">
          <div class="w-20 h-0.5 bg-gradient-to-r from-[#FFCD4B] to-[#EBB738] mb-8"></div>
          <h3
            class="text-white text-4xl md:text-5xl font-extralight uppercase tracking-wider mb-8"
          >
            {{ featuredProject.title }}
          </h3>
          <p class="text-zinc-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-12">
            {{ featuredProject.description }}
          </p>
          <router-link
            :to="`/projects/${featuredProject.id}`"
            class="inline-flex items-center gap-3 px-10 py-4 bg-[#FFCD4B] hover:bg-[#EBB738] text-black border border-[#FFCD4B] font-light tracking-wider uppercase text-sm transition-all duration-300"
          >
            <span>{{ t('buttons.see_details') }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
