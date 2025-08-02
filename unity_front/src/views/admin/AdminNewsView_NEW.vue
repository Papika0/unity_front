<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
    <!-- Admin Header Section -->
    <section
      class="relative bg-gradient-to-r from-slate-900 via-slate-800 to-stone-900 py-16 lg:py-20 overflow-hidden"
    >
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>

      <div class="relative max-w-7xl mx-auto px-4 md:px-8">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div class="flex-1">
            <div class="mb-4">
              <div
                class="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6"
              ></div>
            </div>
            <h1 class="text-4xl md:text-6xl font-light text-white mb-6 tracking-wide">
              <span class="font-thin">სიახლეების</span>
              <span class="font-normal text-amber-400"> ადმინ</span>
              <span class="font-thin"> პანელი</span>
            </h1>
            <p class="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
              სიახლეების მართვა, შექმნა, რედაქტირება და წაშლა პროფესიონალურ ინტერფეისში
            </p>
            <div
              class="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-6"
            ></div>
          </div>

          <div class="flex-shrink-0">
            <button
              @click="goToAddNews"
              class="group bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-8 py-4 rounded-2xl font-medium shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 text-lg"
            >
              <svg
                class="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              ახალი სიახლის დამატება
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <!-- Search and Filter Section -->
      <div class="mb-16">
        <div
          class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-8"
        >
          <div class="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <!-- Search Input -->
            <div class="flex-1 max-w-2xl">
              <div class="relative group">
                <input
                  v-model="adminNewsStore.searchQuery"
                  type="text"
                  placeholder="ძებნა სიახლეებში..."
                  class="w-full px-6 py-4 pl-14 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300 text-slate-800 placeholder-slate-500 shadow-sm hover:shadow-md"
                />
                <svg
                  class="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <!-- Filter Tags -->
            <div class="flex flex-wrap gap-3">
              <div
                class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200"
              >
                <svg
                  class="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
                  />
                </svg>
                <span class="text-slate-600 font-medium text-sm"
                  >სულ: {{ articlesCount }} სიახლე</span
                >
              </div>
              <div
                class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-50 rounded-xl border border-green-200"
              >
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-green-700 font-medium text-sm">რეალური დრო</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-32">
        <div class="relative">
          <div class="animate-spin rounded-full h-20 w-20 border-4 border-slate-200"></div>
          <div
            class="animate-spin rounded-full h-20 w-20 border-4 border-amber-400 border-t-transparent absolute top-0 left-0"
          ></div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-3xl p-12 text-center shadow-lg"
      >
        <div class="text-red-300 mb-6">
          <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="text-2xl font-light text-red-800 mb-4">სიახლეების ჩატვირთვის შეცდომა</h3>
        <p class="text-red-600 text-lg mb-8">{{ error }}</p>
        <button
          @click="adminNewsStore.loadArticles()"
          class="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          ხელახლა ცდა
        </button>
      </div>

      <div v-else>
        <!-- Articles Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-light text-slate-800 mb-4">
            {{ adminNewsStore.searchQuery ? 'ძებნის შედეგები' : 'ყველა სიახლე' }}
          </h2>
          <div
            class="w-16 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-6"
          ></div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredArticles.length === 0" class="text-center py-20">
          <div class="text-slate-300 mb-8">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
              />
            </svg>
          </div>
          <h3 class="text-2xl font-light text-slate-700 mb-4">სიახლეები ვერ მოიძებნა</h3>
          <p class="text-slate-500 text-lg mb-8">
            {{
              adminNewsStore.searchQuery
                ? 'სცადეთ სხვა საძიებო სიტყვები'
                : 'ჯერ არცერთი სიახლე არ არის დამატებული'
            }}
          </p>
          <button
            v-if="!adminNewsStore.searchQuery"
            @click="goToAddNews"
            class="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-8 py-4 rounded-2xl font-medium shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            პირველი სიახლის დამატება
          </button>
        </div>

        <!-- News Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <article
            v-for="article in filteredArticles"
            :key="article.id"
            class="group bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/50 hover:border-amber-200 transform hover:-translate-y-1"
          >
            <!-- Article Image -->
            <div class="relative overflow-hidden">
              <img
                v-if="article.main_image"
                :src="
                  article.main_image.startsWith('http')
                    ? article.main_image
                    : backendUrl + article.main_image
                "
                :alt="article.title.ka"
                class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div
                v-else
                class="w-full h-56 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 flex items-center justify-center"
              >
                <svg
                  class="h-20 w-20 text-amber-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>

              <!-- Overlay gradient -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>

              <!-- Status badges -->
              <div class="absolute top-4 left-4 flex gap-2">
                <span
                  v-if="article.is_featured"
                  class="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-medium rounded-full shadow-lg"
                >
                  ⭐ რჩეული
                </span>
                <span
                  v-if="!article.is_active"
                  class="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-full shadow-lg"
                >
                  🚫 არააქტიური
                </span>
              </div>

              <!-- Category badge -->
              <div class="absolute top-4 right-4">
                <span
                  class="px-3 py-1 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-medium rounded-full border border-slate-200 shadow-sm"
                >
                  {{ getCategoryLabel(article.category) }}
                </span>
              </div>
            </div>

            <!-- Article Info -->
            <div class="p-6">
              <!-- Meta info -->
              <div class="flex items-center justify-between text-sm text-slate-500 mb-4">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span class="font-medium">{{ formatDate(article.publish_date) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span class="font-medium">{{ article.views }} ნახვა</span>
                </div>
              </div>

              <!-- Title -->
              <h3
                class="text-lg font-semibold text-slate-900 mb-4 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300 leading-snug"
              >
                {{ article.title.ka }}
              </h3>

              <!-- Excerpt -->
              <p class="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                {{ article.excerpt.ka }}
              </p>

              <!-- Tags -->
              <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
                <span
                  v-for="tag in article.tags.slice(0, 3)"
                  :key="tag"
                  class="px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 text-xs font-medium rounded-full border border-slate-200"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="article.tags.length > 3"
                  class="px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200"
                >
                  +{{ article.tags.length - 3 }}
                </span>
              </div>

              <!-- Action buttons -->
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="goToView(article.id)"
                  class="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 px-4 py-3 rounded-xl hover:from-slate-200 hover:to-slate-100 transition-all duration-300 font-medium text-sm border border-slate-200 flex items-center justify-center gap-2 group/btn"
                >
                  <svg
                    class="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  ნახვა
                </button>
                <button
                  @click="goToEdit(article.id)"
                  class="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 px-4 py-3 rounded-xl hover:from-amber-200 hover:to-amber-100 transition-all duration-300 font-medium text-sm border border-amber-200 flex items-center justify-center gap-2 group/btn"
                >
                  <svg
                    class="w-4 h-4 group-hover/btn:rotate-12 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  რედაქტირება
                </button>
                <button
                  @click="confirmDelete(article)"
                  class="bg-gradient-to-r from-red-100 to-red-50 text-red-700 px-4 py-3 rounded-xl hover:from-red-200 hover:to-red-100 transition-all duration-300 font-medium text-sm border border-red-200 flex items-center justify-center gap-2 group/btn"
                >
                  <svg
                    class="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  წაშლა
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="cancelDelete"
    >
      <div
        class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full mx-4 border border-slate-200/50"
      >
        <div class="p-8">
          <div class="flex items-center mb-6">
            <div
              class="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-red-100 to-red-50 rounded-2xl flex items-center justify-center border border-red-200"
            >
              <svg
                class="w-7 h-7 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-xl font-semibold text-slate-900">სიახლის წაშლა</h3>
              <p class="text-slate-600 text-sm mt-1">შეუქცევადი მოქმედება</p>
            </div>
          </div>

          <div class="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200">
            <p class="text-slate-700 leading-relaxed">
              დარწმუნებული ხართ, რომ გსურთ
              <strong class="text-slate-900">"{{ articleToDelete?.title.ka }}"</strong>
              სიახლის წაშლა?
            </p>
          </div>

          <div class="flex gap-4">
            <button
              @click="cancelDelete"
              :disabled="saving"
              class="flex-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 px-6 py-3 rounded-2xl hover:from-slate-200 hover:to-slate-100 transition-all duration-300 font-medium disabled:opacity-50 border border-slate-200"
            >
              გაუქმება
            </button>
            <button
              @click="deleteNews"
              :disabled="saving"
              class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg v-if="saving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ saving ? 'იშლება...' : 'წაშლა' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminNewsStore, type NewsArticle } from '@/stores/adminNews'

const router = useRouter()
const adminNewsStore = useAdminNewsStore()
const backendUrl = import.meta.env.VITE_API_BASE_URL

// Local state
const showDeleteModal = ref(false)
const articleToDelete = ref<NewsArticle | null>(null)

// Computed
const articles = computed(() => adminNewsStore.articles)
const filteredArticles = computed(() => adminNewsStore.filteredArticles)
const articlesCount = computed(() => adminNewsStore.articlesCount)
const loading = computed(() => adminNewsStore.loading)
const saving = computed(() => adminNewsStore.saving)
const error = computed(() => adminNewsStore.error)

// Methods
const goToAddNews = () => {
  router.push('/admin/news/add')
}

const goToView = (id: number) => {
  router.push(`/admin/news/${id}`)
}

const goToEdit = (id: number) => {
  router.push(`/admin/news/${id}/edit`)
}

const confirmDelete = (article: NewsArticle) => {
  articleToDelete.value = article
  showDeleteModal.value = true
}

const cancelDelete = () => {
  articleToDelete.value = null
  showDeleteModal.value = false
}

const deleteNews = async () => {
  if (!articleToDelete.value) return

  try {
    const result = await adminNewsStore.removeArticle(articleToDelete.value.id)
    if (result.success) {
      showDeleteModal.value = false
      articleToDelete.value = null
    }
  } catch (err) {
    console.error('Error deleting news article:', err)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    company: 'კომპანია',
    project: 'პროექტი',
    industry: 'ინდუსტრია',
    event: 'ღონისძიება',
  }
  return labels[category] || category
}

// Lifecycle
onMounted(() => {
  adminNewsStore.loadArticles()
})
</script>

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
