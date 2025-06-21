<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()
const route = useRoute()
const router = useRouter()

const project = ref<any>(null)
const selectedImageIndex = ref(0)

// Mock project data - in real app this would come from API
const projects = {
  1: {
    id: 1,
    title: 'თანამედროვე საცხოვრებელი კომპლექსი',
    description: 'ლუქსი კლასის საცხოვრებელი კომპლექსი თბილისის ცენტრში. კომპლექსი შედგება 12 ეტაჟისფერი შენობისგან და მოიცავს 150 ბინას სხვადასხვა ფართობის.',
    fullDescription: `ეს არის უნიკალური საცხოვრებელი პროექტი, რომელიც აერთიანებს თანამედროვე დიზაინს და ფუნქციონალურობას. კომპლექსი განთავსებულია თბილისის პრესტიჟულ რაიონში და გთავაზობთ კომფორტულ საცხოვრებელ გარემოს.
    
    პროექტი მოიცავს:
    • 150 ბინას სხვადასხვა ფართობის (45-150 მ²)
    • თანამედროვე ფიტნეს ცენტრს
    • ბავშვთა ბაღს და სათამაშო მოედანს
    • ინდივიდუალურ პარკინგს
    • 24/7 უსაფრთხოების სისტემას
    • ლანდშაფტური ბაღებს
    
    შენობა აშენებულია ყველაზე თანამედროვე ტექნოლოგიებით და ეკოლოგიურად სუფთა მასალებით.`,
    images: [
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600'
    ],
    area: '25,000 მ²',
    status: 'დასრულებული',
    year: 2023,
    category: 'residential',
    location: 'ვაკე, თბილისი',
    apartments: 150,
    floors: 12,
    features: [
      'ფიტნეს ცენტრი',
      'ბავშვთა ბაღი',
      'პარკინგი',
      'უსაფრთხოება 24/7',
      'ლანდშაფტური ბაღები',
      'კონსიერჟ სერვისი'
    ],
    specifications: {
      'მთლიანი ფართობი': '25,000 მ²',
      'ეტაჟების რაოდენობა': '12',
      'ბინების რაოდენობა': '150',
      'პარკინგი': '200 ადგილი',
      'ლიფტები': '4',
      'კონსტრუქცია': 'მონოლითური'
    }
  }
  // Add more projects as needed
}

const relatedProjects = ref([
  {
    id: 2,
    title: 'ბიზნეს ცენტრი "უნითი"',
    image: '/api/placeholder/300/200',
    category: 'commercial'
  },
  {
    id: 4,
    title: 'ეკო რეზიდენსი',
    image: '/api/placeholder/300/200',
    category: 'residential'
  },
  {
    id: 5,
    title: 'ალუბლის ბაღის რეზიდენსი',
    image: '/api/placeholder/300/200',
    category: 'residential'
  }
])

onMounted(() => {
  const projectId = parseInt(route.params.id as string)
  project.value = projects[projectId as keyof typeof projects]
  
  if (!project.value) {
    router.push('/projects')
  }
})

const selectImage = (index: number) => {
  selectedImageIndex.value = index
}

const navigateToProject = (projectId: number) => {
  router.push(`/project/${projectId}`)
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div v-if="project" class="project-detail">
    <!-- Hero Section -->
    <section class="relative h-96 bg-gradient-to-r from-gray-900 to-gray-700">
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <button
            @click="goBack"
            class="text-white hover:text-yellow-500 mb-4 flex items-center"
          >
            ← უკან დაბრუნება
          </button>
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
            {{ project.title }}
          </h1>
          <div class="flex flex-wrap gap-4 text-white">
            <span class="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm">
              {{ project.status }}
            </span>
            <span>📍 {{ project.location }}</span>
            <span>📅 {{ project.year }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Image Gallery -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="aspect-video bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center">
              <svg class="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
            
            <!-- Thumbnail Gallery -->
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="(image, index) in project.images"
                :key="index"
                @click="selectImage(index)"
                class="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                :class="selectedImageIndex === index ? 'ring-2 ring-yellow-500' : ''"
              >
              </div>
            </div>
          </div>

          <!-- Project Details -->
          <div class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold mb-4">პროექტის აღწერა</h2>
              <div class="prose max-w-none text-gray-600">
                <p v-for="paragraph in project.fullDescription.split('\n\n')" :key="paragraph" class="mb-4">
                  {{ paragraph }}
                </p>
              </div>
            </div>

            <!-- Features -->
            <div>
              <h3 class="text-xl font-bold mb-4">ინფრასტრუქტურა</h3>
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="feature in project.features"
                  :key="feature"
                  class="flex items-center space-x-2"
                >
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span class="text-gray-700">{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Specifications -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12">ტექნიკური მონაცემები</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(value, key) in project.specifications"
            :key="key"
            class="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 class="text-sm text-gray-500 mb-2">{{ key }}</h3>
            <p class="text-xl font-bold text-gray-900">{{ value }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Related Projects -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12">მსგავსი პროექტები</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="relatedProject in relatedProjects"
            :key="relatedProject.id"
            @click="navigateToProject(relatedProject.id)"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            <div class="h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-lg mb-2">{{ relatedProject.title }}</h3>
              <span class="text-sm text-gray-500">{{ relatedProject.category }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">დაინტერესდით ამ პროექტით?</h2>
        <p class="text-xl text-gray-300 mb-8">დაგვიკავშირდით დეტალური ინფორმაციისთვის</p>
        <router-link
          to="/contact"
          class="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
        >
          {{ t('contact.title') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.prose p {
  white-space: pre-line;
}
</style>
