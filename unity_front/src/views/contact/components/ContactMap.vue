<script setup lang="ts">
import { useScrollAnimation } from '@/composables/useScrollAnimation'

interface ContactInfoItem {
  title: string
  value?: string
  subtitle?: string
}

interface MapCoordinates {
  latitude: number
  longitude: number
  zoom?: number
}

defineProps<{
  mapLoaded: boolean
  mapCoordinates: MapCoordinates | null
  contactInfo: ContactInfoItem[] | null
  t: (key: string) => string
}>()

// Component manages its own scroll animation
const { element: mapElement, isVisible: mapVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <section ref="mapElement" class="relative h-[500px] bg-zinc-100 overflow-hidden transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="{
      'opacity-100 scale-100': mapVisible,
      'opacity-0 scale-95': !mapVisible,
    }"
  >
    <!-- Map Container -->
    <div class="absolute inset-0">
      <!-- Google Maps iframe with location pin -->
      <iframe
        v-if="mapLoaded && mapCoordinates"
        :src="`https://maps.google.com/maps?q=${mapCoordinates.latitude},${mapCoordinates.longitude}&t=&z=${mapCoordinates.zoom || 16}&ie=UTF8&iwloc=&output=embed`"
        width="100%"
        height="100%"
        frameborder="0"
        style="border: 0"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="grayscale contrast-75 brightness-95"
      ></iframe>

      <!-- Loading state -->
      <div
        v-else
        class="h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200"
      >
        <div class="text-center">
          <svg
            class="w-12 h-12 text-zinc-400 mx-auto mb-4 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p class="text-zinc-500 font-light">{{ t('contact.map.loading') }}</p>
        </div>
      </div>
    </div>

    <!-- Overlay with address -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8"
    >
      <div class="container mx-auto px-6 lg:px-12 xl:px-20">
        <div class="text-white">
          <h3 class="text-2xl font-light mb-2">{{ t('contact.map.office.title') }}</h3>
          <p v-if="contactInfo && contactInfo[0]" class="text-[#FFCD4B] font-light">
            {{ contactInfo[0].value }}, {{ contactInfo[0].subtitle }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Google Maps styling */
iframe {
  filter: grayscale(100%) contrast(0.9) brightness(0.95);
  transition: filter 0.3s ease;
}

iframe:hover {
  filter: grayscale(50%) contrast(1) brightness(1);
}
</style>
