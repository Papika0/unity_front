<script setup lang="ts">
import { useNewsDetail } from './news/composables'
import { NewsGallery, NewsGalleryModal, NewsRelatedArticles } from './news/components'

const {
  t,
  scrollProgress,
  breadcrumbElement,
  breadcrumbVisible,
  headerElement,
  headerVisible,
  mainImageElement,
  mainImageVisible,
  contentElement,
  contentVisible,
  galleryElement,
  galleryVisible,
  error,
  showGalleryModal,
  currentGalleryIndex,
  article,
  isLoading,
  relatedArticles,
  formattedDate,
  categoryLabels,
  openGallery,
  closeGallery,
  nextImage,
  prevImage,
} = useNewsDetail()
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out shadow-[0_0_15px_rgba(255,205,75,0.6)]"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen bg-white">
      <div class="text-center">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"
        ></div>
        <p class="text-lg text-[#FFCD4B] font-light uppercase tracking-wider">
          {{ t('news.loading') }}
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen bg-white">
      <div class="text-5xl mb-6">⚠️</div>
      <h1 class="text-xl font-light text-zinc-800 mb-4">{{ error }}</h1>
      <router-link
        to="/news"
        class="inline-flex items-center gap-3 px-8 py-3 bg-black text-[#FFCD4B] text-sm uppercase tracking-wider font-light transition-all duration-300 hover:bg-zinc-900"
      >
        {{ t('buttons.back') }}
      </router-link>
    </div>

    <!-- Article Content -->
    <div v-else-if="article && article.id" class="max-w-4xl mx-auto px-8 lg:px-16 xl:px-20 py-16">
      <!-- Breadcrumb -->
      <nav ref="breadcrumbElement" class="mb-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'opacity-100 translate-y-0': breadcrumbVisible,
          'opacity-0 translate-y-8': !breadcrumbVisible,
        }"
      >
        <ol class="flex items-center space-x-2 text-sm text-zinc-600 font-light">
          <li>
            <router-link to="/" class="hover:text-[#FFCD4B] transition-colors">{{
              t('header.home')
            }}</router-link>
          </li>
          <li>/</li>
          <li>
            <router-link to="/news" class="hover:text-[#FFCD4B] transition-colors">{{
              t('news.title')
            }}</router-link>
          </li>
          <li>/</li>
          <li class="text-zinc-900">{{ article.title }}</li>
        </ol>
      </nav>

      <!-- Article Header -->
      <header ref="headerElement" class="mb-12">
        <!-- Category & Date -->
        <div class="flex items-center gap-4 mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-x-0': headerVisible,
            'opacity-0 -translate-x-8': !headerVisible,
          }"
        >
          <span
            class="px-4 py-1.5 bg-black/5 text-zinc-800 text-sm font-light uppercase tracking-wider border border-zinc-200"
          >
            {{ categoryLabels[article.category] || article.category }}
          </span>
          <time class="text-zinc-600 text-sm font-light">{{ formattedDate }}</time>
          <span class="text-zinc-400 text-sm font-light"
            >{{ article.views }} {{ t('news.views') }}</span
          >
        </div>

        <!-- Title -->
        <h1
          class="text-4xl md:text-5xl font-light text-zinc-900 leading-tight mb-6 tracking-tight transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
          :class="{
            'opacity-100 translate-y-0': headerVisible,
            'opacity-0 translate-y-8': !headerVisible,
          }"
        >
          {{ article.title }}
        </h1>

        <!-- Divider -->
        <div class="w-20 h-0.5 bg-[#FFCD4B] mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-left"
          :class="{
            'scale-x-100': headerVisible,
            'scale-x-0': !headerVisible,
          }"
        ></div>

        <!-- Excerpt -->
        <p class="text-xl text-zinc-700 leading-relaxed font-light transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-300"
          :class="{
            'opacity-100 translate-y-0': headerVisible,
            'opacity-0 translate-y-8': !headerVisible,
          }"
        >
          {{ article.excerpt }}
        </p>
      </header>

      <!-- Main Image -->
      <div ref="mainImageElement" class="mb-12 group transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'opacity-100 translate-y-0 scale-100 blur-0': mainImageVisible,
          'opacity-0 translate-y-12 scale-95 blur-sm': !mainImageVisible,
        }"
      >
        <div class="relative overflow-hidden border border-zinc-100">
          <img
            :src="article.main_image?.url || 'https://placehold.co/800x400'"
            :alt="article.main_image?.alt_text || article.title"
            class="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <!-- Golden accent line on hover -->
          <div
            class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
          ></div>
        </div>
      </div>

      <!-- Article Content -->
      <article ref="contentElement" class="mb-20">
        <div
          class="prose prose-lg prose-zinc max-w-none transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-y-0 scale-100 blur-0': contentVisible,
            'opacity-0 translate-y-12 scale-95 blur-sm': !contentVisible,
          }"
          style="color: #18181b;"
          v-html="article.content"
        ></div>
      </article>

      <!-- Gallery Images -->
      <div ref="galleryElement">
        <NewsGallery
          v-if="article.gallery_images && article.gallery_images.length > 0"
          :images="article.gallery_images"
          :article-title="article.title"
          :is-visible="galleryVisible"
          @open-gallery="openGallery"
        />
      </div>

      <!-- Gallery Modal -->
      <NewsGalleryModal
        v-if="showGalleryModal && article && article.gallery_images"
        :images="article.gallery_images"
        :current-index="currentGalleryIndex"
        :article-title="article.title"
        @close="closeGallery"
        @next="nextImage"
        @prev="prevImage"
      />
    </div>

    <!-- Related Articles -->
    <NewsRelatedArticles :articles="relatedArticles" />
  </div>
</template>

<style scoped>
/* Prose content styling - ensure all text is visible and black */
:deep(.prose) {
  color: #18181b;
}

:deep(.prose p),
:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4),
:deep(.prose h5),
:deep(.prose h6),
:deep(.prose li),
:deep(.prose span),
:deep(.prose div) {
  color: #18181b !important;
}

:deep(.prose a) {
  color: #FFCD4B !important;
  text-decoration: underline;
}

:deep(.prose a:hover) {
  color: #C89116 !important;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #18181b;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #ffcd4b, #ebb738, #c89116);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ebb738, #c89116, #a37814);
}

/* Selection color */
::selection {
  background: #ffcd4b;
  color: #000;
}

::-moz-selection {
  background: #ffcd4b;
  color: #000;
}
</style>
