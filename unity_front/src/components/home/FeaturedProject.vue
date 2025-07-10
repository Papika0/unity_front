<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { useProjectsStore } from '../../stores/projects'

const { t } = useTranslations()
const projectsStore = useProjectsStore()

// Get the first featured project or fallback to first active project
const featuredProject = computed(() => {
  const featured = projectsStore.featuredProjects[0]
  if (featured) return featured

  // Fallback to first active project if no featured project exists
  return projectsStore.activeProjects[0] || null
})
</script>

<template>
  <!-- Featured Project -->
  <section v-if="featuredProject" class="bg-white">
    <div class="w-full">
      <div class="relative">
        <img
          :src="featuredProject.main_image || 'https://placehold.co/900x806'"
          :alt="featuredProject.title.ka"
          class="w-full h-[800px] object-cover"
        />
        <div class="absolute inset-0 bg-zinc-900/50"></div>

        <div class="absolute inset-0 flex flex-col justify-center items-center text-center px-8">
          <h3
            class="text-orange-100 text-4xl font-normal font-roboto uppercase leading-loose tracking-[3px] mb-8"
          >
            {{ featuredProject.title.ka }}
          </h3>
          <p class="text-orange-100 text-xl font-normal font-roboto leading-loose max-w-2xl mb-12">
            {{ featuredProject.description.ka }}
          </p>
          <router-link
            :to="`/projects/${featuredProject.id}`"
            class="text-orange-100 text-base font-normal font-roboto uppercase leading-tight tracking-[3.36px] hover:text-amber-300 transition-colors"
          >
            {{ t('featured.cta') }}
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
