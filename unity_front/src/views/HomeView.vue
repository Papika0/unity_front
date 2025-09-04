<script setup lang="ts">
import { onMounted, watch } from 'vue'
import HeroSection from '../components/home/HeroSection.vue'
import AboutSection from '../components/home/AboutSection.vue'
import ProjectsSection from '../components/home/ProjectsSection.vue'
import FeaturedProject from '../components/home/FeaturedProject.vue'
import NewsSection from '../components/home/NewsSection.vue'
import { useHomepageStore } from '@/stores/public/homepage'
import { useLocaleStore } from '@/stores/ui/locale'

const homepageStore = useHomepageStore()
const localeStore = useLocaleStore()

onMounted(async () => {
  await homepageStore.loadHomepageData()
})

// Watch for locale changes and refetch data
watch(
  () => localeStore.currentLocale,
  async (newLocale, oldLocale) => {
    if (newLocale !== oldLocale) {
      await homepageStore.loadHomepageData()
    }
  },
)
</script>

<template>
  <div>
    <HeroSection />
    <AboutSection />
    <ProjectsSection />
    <FeaturedProject />
    <NewsSection />
  </div>
</template>
