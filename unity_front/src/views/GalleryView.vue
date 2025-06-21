<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()

const selectedCategory = ref('all')
const selectedImage = ref<number | null>(null)

const categories = ref([
  { value: 'all', label: 'ყველა' },
  { value: 'exterior', label: 'ფასადები' },
  { value: 'interior', label: 'ინტერიერი' },
  { value: 'landscape', label: 'ლანდშაფტი' },
  { value: 'commercial', label: 'კომერციული' },
  { value: 'residential', label: 'საცხოვრებელი' }
])

const galleryItems = ref([
  {
    id: 1,
    title: 'თანამედროვე საცხოვრებელი კომპლექსი - ფასადი',
    category: 'exterior',
    project: 'Unity Residence',
    year: 2023,
    image: '/api/placeholder/600/400'
  },
  {
    id: 2,
    title: 'ლუქსი ბინის ინტერიერი',
    category: 'interior',
    project: 'Unity Residence',
    year: 2023,
    image: '/api/placeholder/600/400'
  },
  {
    id: 3,
    title: 'ბიზნეს ცენტრის ლობი',
    category: 'commercial',
    project: 'Unity Business Center',
    year: 2024,
    image: '/api/placeholder/600/400'
  },
  {
    id: 4,
    title: 'ეკო რეზიდენსის ლანდშაფტი',
    category: 'landscape',
    project: 'Eco Residence',
    year: 2022,
    image: '/api/placeholder/600/400'
  },
  {
    id: 5,
    title: 'მოდერნისტული ვილის ფასადი',
    category: 'exterior',
    project: 'Modern Villa',
    year: 2023,
    image: '/api/placeholder/600/400'
  },
  {
    id: 6,
    title: 'საოფისე ინტერიერი',
    category: 'interior',
    project: 'Unity Business Center',
    year: 2024,
    image: '/api/placeholder/600/400'
  },
  {
    id: 7,
    title: 'კულტურული ცენტრის ფასადი',
    category: 'exterior',
    project: 'Cultural Center',
    year: 2024,
    image: '/api/placeholder/600/400'
  },
  {
    id: 8,
    title: 'რეზიდენსის ეზო',
    category: 'landscape',
    project: 'Unity Residence',
    year: 2023,
    image: '/api/placeholder/600/400'
  },
  {
    id: 9,
    title: 'ბავშვთა ოთახის დიზაინი',
    category: 'interior',
    project: 'Family Villa',
    year: 2023,
    image: '/api/placeholder/600/400'
  },
  {
    id: 10,
    title: 'შოპინგ ცენტრის ატრიუმი',
    category: 'commercial',
    project: 'Galaxy Shopping Center',
    year: 2023,
    image: '/api/placeholder/600/400'
  },
  {
    id: 11,
    title: 'ბალკონის ლანდშაფტი',
    category: 'landscape',
    project: 'Penthouse',
    year: 2024,
    image: '/api/placeholder/600/400'
  },
  {
    id: 12,
    title: 'ეკო ვილის ღია ეზო',
    category: 'residential',
    project: 'Eco Villa',
    year: 2022,
    image: '/api/placeholder/600/400'
  }
])

const filteredGallery = computed(() => {
  if (selectedCategory.value === 'all') {
    return galleryItems.value
  }
  return galleryItems.value.filter(item => item.category === selectedCategory.value)
})

const openLightbox = (id: number) => {
  selectedImage.value = id
}

const closeLightbox = () => {
  selectedImage.value = null
}

const getSelectedImageData = computed(() => {
  if (selectedImage.value === null) return null
  return galleryItems.value.find(item => item.id === selectedImage.value)
})

const nextImage = () => {
  if (selectedImage.value === null) return
  const currentIndex = filteredGallery.value.findIndex(item => item.id === selectedImage.value)
  const nextIndex = (currentIndex + 1) % filteredGallery.value.length
  selectedImage.value = filteredGallery.value[nextIndex].id
}

const prevImage = () => {
  if (selectedImage.value === null) return
  const currentIndex = filteredGallery.value.findIndex(item => item.id === selectedImage.value)
  const prevIndex = currentIndex === 0 ? filteredGallery.value.length - 1 : currentIndex - 1
  selectedImage.value = filteredGallery.value[prevIndex].id
}
</script>

<template>
  <div class="gallery-page">
    <!-- Hero Section -->
    <section class="relative h-96 bg-gradient-to-r from-gray-900 to-gray-700">
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            {{ t('gallery.title') }}
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl">
            ნახეთ ჩვენი რეალიზებული პროექტების ფოტო კოლექცია და შეიცნობეთ ჩვენი მუშაობის ხარისხი
          </p>
        </div>
      </div>
    </section>

    <!-- Filter Section -->
    <section class="py-8 bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap gap-4 justify-center">
          <button
            v-for="category in categories"
            :key="category.value"
            @click="selectedCategory = category.value"
            class="px-6 py-2 rounded-full font-medium transition-colors duration-200"
            :class="selectedCategory === category.value 
              ? 'bg-yellow-500 text-black' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Gallery Grid -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="item in filteredGallery"
            :key="item.id"
            @click="openLightbox(item.id)"
            class="group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <!-- Image placeholder -->
            <div class="aspect-square bg-gradient-to-br from-gray-300 to-gray-400 relative overflow-hidden">
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <svg class="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Image info overlay -->
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 class="text-white font-semibold text-sm mb-1">{{ item.title }}</h3>
                <p class="text-gray-300 text-xs">{{ item.project }} • {{ item.year }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="text-center mt-12">
          <button class="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
            მეტი ფოტოს ნახვა
          </button>
        </div>
      </div>
    </section>

    <!-- Lightbox Modal -->
    <div
      v-if="selectedImage && getSelectedImageData"
      @click="closeLightbox"
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
    >
      <div class="relative max-w-4xl w-full">
        <!-- Close Button -->
        <button
          @click="closeLightbox"
          class="absolute top-4 right-4 z-10 text-white hover:text-yellow-500 transition-colors"
        >
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Navigation Buttons -->
        <button
          @click.stop="prevImage"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-yellow-500 transition-colors z-10"
        >
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <button
          @click.stop="nextImage"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-yellow-500 transition-colors z-10"
        >
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Image Container -->
        <div @click.stop class="bg-white rounded-lg overflow-hidden">
          <!-- Large image placeholder -->
          <div class="aspect-video bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <svg class="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
          
          <!-- Image Info -->
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-2">{{ getSelectedImageData.title }}</h2>
            <div class="flex items-center justify-between text-gray-600">
              <span>{{ getSelectedImageData.project }}</span>
              <span>{{ getSelectedImageData.year }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
