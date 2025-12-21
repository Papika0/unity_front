<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('cancel')"
  >
    <div
      class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-4xl w-full mx-4 border border-slate-200/50 max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Modal Header -->
      <div class="p-8 border-b border-slate-200/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div
              class="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center border border-purple-200"
            >
              <svg
                class="w-7 h-7 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-2xl font-semibold text-slate-900">{{ t('admin.news.manage_featured') }}</h3>
              <p class="text-slate-600 text-sm mt-1">
                {{ t('admin.news.select_featured_desc', { count: selectedNewsIds.length, max: 2 }) }}
              </p>
            </div>
          </div>
          <button
            @click="$emit('cancel')"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-8">
        <!-- Current Featured News Info -->
        <div v-if="featuredArticles.length > 0" class="mb-8">
          <h4 class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            {{ t('admin.news.current_featured') }}
          </h4>
          <div class="grid gap-3">
            <div
              v-for="article in featuredArticles"
              :key="article.id"
              class="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
            >
              <img
                v-if="article.main_image"
                :src="
                  typeof article.main_image === 'string'
                    ? article.main_image
                    : article.main_image.url
                "
                :alt="
                  typeof article.main_image === 'string'
                    ? article.title.ka
                    : article.main_image.alt_text || article.title.ka
                "
                class="w-16 h-16 object-cover rounded-xl"
              />
              <div class="flex-1">
                <h5 class="font-semibold text-slate-900">{{ article.title.ka }}</h5>
                <p class="text-sm text-slate-600">{{ formatDate(article.publish_date) }}</p>
              </div>
              <div class="text-amber-500">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Available News List -->
        <div>
          <h4 class="text-lg font-semibold text-slate-900 mb-4">{{ t('admin.news.all_news') }}</h4>
          <div class="grid gap-3 max-h-96 overflow-y-auto">
            <div
              v-for="article in allArticles"
              :key="article.id"
              @click="$emit('toggleSelection', article.id)"
              class="flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md"
              :class="[
                selectedNewsIds.includes(article.id)
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-slate-200 bg-white hover:border-slate-300',
                !canSelectMore && !selectedNewsIds.includes(article.id)
                  ? 'opacity-50 cursor-not-allowed'
                  : '',
              ]"
            >
              <!-- Selection Checkbox -->
              <div class="flex-shrink-0">
                <div
                  class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors"
                  :class="
                    selectedNewsIds.includes(article.id)
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-slate-300'
                  "
                >
                  <svg
                    v-if="selectedNewsIds.includes(article.id)"
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <!-- Article Image -->
              <img
                v-if="article.main_image"
                :src="
                  typeof article.main_image === 'string'
                    ? article.main_image
                    : article.main_image.url
                "
                :alt="
                  typeof article.main_image === 'string'
                    ? article.title.ka
                    : article.main_image.alt_text || article.title.ka
                "
                class="w-16 h-16 object-cover rounded-xl"
              />
              <div
                v-else
                class="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center"
              >
                <svg
                  class="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <!-- Article Info -->
              <div class="flex-1">
                <h5 class="font-semibold text-slate-900 line-clamp-1">{{ article.title.ka }}</h5>
                <p class="text-sm text-slate-600 mt-1">{{ formatDate(article.publish_date) }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
                    :class="
                      article.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    "
                  >
                    {{ article.is_active ? t('admin.common.active') : t('admin.common.inactive') }}
                  </span>
                  <span
                    v-if="article.is_featured"
                    class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800"
                  >
                    ⭐ {{ t('admin.common.featured') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-8 border-t border-slate-200/50">
        <div class="flex gap-4">
          <button
            @click="$emit('cancel')"
            :disabled="saving"
            class="flex-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 px-6 py-3 rounded-2xl hover:from-slate-200 hover:to-slate-100 transition-all duration-300 font-medium disabled:opacity-50 border border-slate-200"
          >
            {{ t('admin.common.cancel') }}
          </button>
          <button
            @click="$emit('confirm')"
            :disabled="saving || selectedNewsIds.length === 0"
            class="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg
              v-if="saving"
              class="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
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
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            {{ saving ? t('admin.common.saving') : t('admin.news.mark_as_featured', { count: selectedNewsIds.length }) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminNewsArticle } from '@/types/index'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

defineProps<{
  show: boolean
  saving: boolean
  featuredArticles: AdminNewsArticle[]
  allArticles: AdminNewsArticle[]
  selectedNewsIds: number[]
  canSelectMore: boolean
}>()

defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
  (e: 'toggleSelection', id: number): void
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
