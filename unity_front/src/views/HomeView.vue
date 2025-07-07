<script setup lang="ts">
import { useTranslations } from '../composables/useTranslations'
import HeroSection from '../components/home/HeroSection.vue'
import AboutSection from '../components/home/AboutSection.vue'
import ProjectsSection from '../components/home/ProjectsSection.vue'
import FeaturedProject from '../components/home/FeaturedProject.vue'
import NewsSection from '../components/home/NewsSection.vue'

const { t } = useTranslations()
</script>

<template>
  <div class="relative">
    <HeroSection />
    <AboutSection />
    <ProjectsSection />
    <FeaturedProject />
    <NewsSection />
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
