<script setup lang="ts">
import { getImageUrl } from '@/utils/imageUrl'
import type { Project } from '@/stores/public/projects'

interface Props {
  project: Project
  index: number
  currentSlide: number
  previousSlide: number | null
  slideDirection: 'next' | 'prev'
  hasInitiallyLoaded: boolean
  scrollProgress: number
}

defineProps<Props>()
</script>

<template>
  <div class="absolute inset-0">
    <!-- Background Image with enhanced animations -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[2500ms] ease-out will-change-transform"
      :style="`
        background-image: url('${getImageUrl(project.main_image)}');
        transform: scale(${index === currentSlide ? 1.05 + (scrollProgress * 0.1) : index === previousSlide && slideDirection === 'next' ? 1.15 : 1})
                   translateX(${index === previousSlide && slideDirection === 'next' ? '-10%' : index === previousSlide && slideDirection === 'prev' ? '10%' : '0'});
        opacity: ${index === currentSlide ? 1 - (scrollProgress * 0.3) : 0};
        filter: blur(${index === previousSlide ? '8px' : '0px'});
      `"
      :class="{
        'scale-110 opacity-0': index === currentSlide && !hasInitiallyLoaded,
      }"
    ></div>

    <!-- Elegant Gradient Overlay with fade-in -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 transition-opacity duration-1000"
      :class="hasInitiallyLoaded ? 'opacity-100' : 'opacity-0'"
      :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 0.5) : 0}`"
    ></div>
    <div
      class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent transition-opacity duration-1000"
      :class="hasInitiallyLoaded ? 'opacity-100' : 'opacity-0'"
      :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 0.5) : 0}`"
    ></div>
  </div>
</template>

<style scoped>
/* Smooth image loading */
[style*='background-image'] {
  will-change: transform;
  transition: opacity 1.5s ease-out;
}
</style>
