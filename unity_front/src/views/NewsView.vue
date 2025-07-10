<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useNewsStore } from '../stores/news'
import type { NewsArticle } from '../stores/news'

const { t } = useTranslations()
const newsStore = useNewsStore()

const selectedCategory = ref<string>('all')
const searchQuery = ref('')
const isLoading = ref(true)

const categoryLabels = {
  all: { ka: 'ყველა', en: 'All' },
  company: { ka: 'კომპანია', en: 'Company' },
  project: { ka: 'პროექტი', en: 'Project' },
  industry: { ka: 'ინდუსტრია', en: 'Industry' },
  event: { ka: 'ღონისძიება', en: 'Event' }
}

const filteredArticles = computed(() => {
  let articles = newsStore.activeArticles

  // Filter by category
  if (selectedCategory.value !== 'all') {
    articles = articles.filter(article => article.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    articles = newsStore.searchArticles(searchQuery.value.trim(), 'ka')
      .filter(article => selectedCategory.value === 'all' || article.category === selectedCategory.value)
  }

  return articles
})

const featuredArticle = computed(() => newsStore.featuredArticles[0] || null)

const regularArticles = computed(() => 
  filteredArticles.value.filter(article => !article.is_featured)
)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadArticles = async () => {
  try {
    isLoading.value = true
    await newsStore.fetchArticles()
  } catch (error) {
    console.error('Failed to load articles:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadArticles()
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <section class="bg-zinc-900 py-24">
      <div class="max-w-7xl mx-auto px-4 md:px-8 text-center">
        <h1 class="text-5xl md:text-6xl font-normal font-roboto text-white uppercase leading-tight tracking-[3px] mb-6">
          სიახლეები
        </h1>
        <p class="text-xl text-zinc-300 max-w-2xl mx-auto">
          იყავით ინფორმირებული უნიტის უახლეს პროექტებზე, მიღწევებზე და ინდუსტრიის სიახლეებზე
        </p>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <!-- Search and Filter Section -->
      <div class="mb-12">
        <div class="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <!-- Search Input -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ძებნა სიახლეებში..."
                class="w-full px-4 py-3 pl-12 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
              />
              <svg 
                class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(label, category) in categoryLabels"
              :key="category"
              @click="selectedCategory = category"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                selectedCategory === category
                  ? 'bg-amber-300 text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              ]"
            >
              {{ label.ka }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-300"></div>
      </div>

      <!-- Featured Article -->
      <div v-else-if="featuredArticle && selectedCategory === 'all' && !searchQuery.trim()" class="mb-16">
        <h2 class="text-3xl font-normal font-roboto text-zinc-900 mb-8">მთავარი სიახლე</h2>
        <img src="../assets/Vector_10.png" alt="" class="mb-12" />
        
        <div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div class="md:flex">
            <div class="md:w-1/2">
              <img 
                :src="featuredArticle.main_image || 'https://placehold.co/600x400'" 
                :alt="featuredArticle.title.ka"
                class="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div class="md:w-1/2 p-8">
              <div class="flex items-center gap-4 mb-4">
                <span class="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                  {{ categoryLabels[featuredArticle.category].ka }}
                </span>
                <time class="text-zinc-600 text-sm">{{ formatDate(featuredArticle.publish_date) }}</time>
              </div>
              
              <h3 class="text-2xl md:text-3xl font-normal font-roboto text-zinc-900 mb-4">
                {{ featuredArticle.title.ka }}
              </h3>
              
              <p class="text-zinc-700 leading-relaxed mb-6">
                {{ featuredArticle.excerpt.ka }}
              </p>
              
              <router-link 
                :to="`/news/${featuredArticle.id}`"
                class="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium"
              >
                სრულად წაკითხვა 
                <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- All Articles Grid -->
      <div v-if="!isLoading">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-normal font-roboto text-zinc-900">
            {{ searchQuery.trim() ? 'ძებნის შედეგები' : 'ყველა სიახლე' }}
          </h2>
          <span class="text-zinc-600">
            {{ filteredArticles.length }} სტატია
          </span>
        </div>
        
        <img src="../assets/Vector_10.png" alt="" class="mb-12" />

        <!-- No Results -->
        <div v-if="filteredArticles.length === 0" class="text-center py-20">
          <div class="text-zinc-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.084-2.327C7.412 15.959 9.405 18 12 18a7.96 7.96 0 005.084-1.827M15 8a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-medium text-zinc-700 mb-2">სიახლეები ვერ მოიძებნა</h3>
          <p class="text-zinc-600">სცადეთ სხვა საძიებო სიტყვები ან კატეგორია</p>
        </div>

        <!-- Articles Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article 
            v-for="article in regularArticles" 
            :key="article.id"
            class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            <div class="relative overflow-hidden">
              <img 
                :src="article.main_image || 'https://placehold.co/400x250'" 
                :alt="article.title.ka"
                class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute top-4 left-4">
                <span class="px-3 py-1 bg-white/90 backdrop-blur-sm text-zinc-800 text-xs font-medium rounded-full">
                  {{ categoryLabels[article.category].ka }}
                </span>
              </div>
            </div>
            
            <div class="p-6">
              <div class="flex items-center gap-2 mb-3">
                <time class="text-zinc-500 text-sm">
                  {{ formatDate(article.publish_date) }}
                </time>
                <span class="text-zinc-300">•</span>
                <span class="text-zinc-500 text-sm">{{ article.views }} ნახვა</span>
              </div>
              
              <h3 class="text-lg font-medium text-zinc-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
                {{ article.title.ka }}
              </h3>
              
              <p class="text-zinc-600 text-sm mb-4 line-clamp-3">
                {{ article.excerpt.ka }}
              </p>
              
              <router-link 
                :to="`/news/${article.id}`"
                class="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                სრულად წაკითხვა
                <svg class="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
