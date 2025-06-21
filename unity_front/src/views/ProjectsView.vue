<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()
const router = useRouter()

const projects = ref([
  {
    id: 1,
    title: 'თანამედროვე საცხოვრებელი კომპლექსი',
    description: 'ლუქსი კლასის საცხოვრებელი კომპლექსი თბილისის ცენტრში',
    image: '/api/placeholder/400/300',
    area: '25,000 მ²',
    status: 'დასრულებული',
    year: 2023,
    category: 'residential'
  },
  {
    id: 2,
    title: 'ბიზნეს ცენტრი "უნითი"',
    description: 'A-კლასის ოფისური ცენტრი',
    image: '/api/placeholder/400/300',
    area: '15,000 მ²',
    status: 'მშენებარე',
    year: 2024,
    category: 'commercial'
  },
  {
    id: 3,
    title: 'კულტურული ცენტრი',
    description: 'მულტიფუნქციური კულტურული სივრცე',
    image: '/api/placeholder/400/300',
    area: '8,000 მ²',
    status: 'პროექტირება',
    year: 2024,
    category: 'cultural'
  },
  {
    id: 4,
    title: 'ეკო რეზიდენსი',
    description: 'მდგრადი განვითარების პრინციპებით აშენებული კომპლექსი',
    image: '/api/placeholder/400/300',
    area: '30,000 მ²',
    status: 'დასრულებული',
    year: 2022,
    category: 'residential'
  },
  {
    id: 5,
    title: 'ალუბლის ბაღის რეზიდენსი',
    description: 'პრემიუმ კლასის საცხოვრებელი კომპლექსი',
    image: '/api/placeholder/400/300',
    area: '12,000 მ²',
    status: 'მშენებარე',
    year: 2024,
    category: 'residential'
  },
  {
    id: 6,
    title: 'შოპინგ ცენტრი "გალაქსი"',
    description: 'თანამედროვე სავაჭრო კომპლექსი',
    image: '/api/placeholder/400/300',
    area: '45,000 მ²',
    status: 'დასრულებული',
    year: 2023,
    category: 'commercial'
  }
])

const selectedCategory = ref('all')
const categories = ref([
  { value: 'all', label: 'ყველა' },
  { value: 'residential', label: 'საცხოვრებელი' },
  { value: 'commercial', label: 'კომერციული' },
  { value: 'cultural', label: 'კულტურული' }
])

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'all') {
    return projects.value
  }
  return projects.value.filter(project => project.category === selectedCategory.value)
})

const viewProjectDetails = (projectId: number) => {
  router.push(`/project/${projectId}`)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'დასრულებული':
      return 'bg-green-100 text-green-800'
    case 'მშენებარე':
      return 'bg-blue-100 text-blue-800'
    case 'პროექტირება':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div class="projects-page">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            {{ t('projects.title') }}
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            ჩვენი რეალიზებული და მშენებარე პროექტების კოლექცია
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

    <!-- Projects Grid -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            @click="viewProjectDetails(project.id)"
          >
            <!-- Project Image -->
            <div class="h-64 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>

            <!-- Project Content -->
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusColor(project.status)"
                >
                  {{ project.status }}
                </span>
                <span class="text-sm text-gray-500">{{ project.year }}</span>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-2">
                {{ project.title }}
              </h3>
              
              <p class="text-gray-600 mb-4 line-clamp-3">
                {{ project.description }}
              </p>

              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  <span class="font-medium">ფართობი:</span> {{ project.area }}
                </div>
                <button class="text-yellow-500 hover:text-yellow-600 font-medium">
                  {{ t('projects.details') }} →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="text-center mt-12">
          <button class="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
            მეტი პროექტის ნახვა
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
