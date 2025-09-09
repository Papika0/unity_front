<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { useProjectsStore, type Project } from '@/stores/public/projects'

const { t } = useTranslations()
const projectsStore = useProjectsStore()

const backendUrl = import.meta.env.VITE_BACKEND_URL

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
  {{ featuredProject }}
  <section v-if="featuredProject" class="bg-white">
    <div class="w-full">
      <div class="relative">
        <img
          :src="backendUrl + featuredProject.main_image || 'https://placehold.co/900x806'"
          :alt="featuredProject.title"
          class="w-full h-[800px] object-cover"
        />
        <div class="absolute inset-0 bg-zinc-900/50"></div>

        <div class="absolute inset-0 flex flex-col justify-center items-center text-center px-8">
          <h3
            class="text-orange-100 text-4xl font-normal font-roboto uppercase leading-loose tracking-[3px] mb-8"
          >
            {{ featuredProject.title }}
          </h3>
          <p class="text-orange-100 text-xl font-normal font-roboto leading-loose max-w-2xl mb-12">
            {{ featuredProject.description }}
          </p>
          <router-link
            :to="`/projects/${featuredProject.id}`"
            class="text-orange-100 text-base font-normal font-roboto uppercase leading-tight tracking-[3.36px] hover:text-amber-300 transition-colors"
          >
            {{ t('buttons.see_details') }}
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
