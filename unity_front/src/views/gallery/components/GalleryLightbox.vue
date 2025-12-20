<script setup lang="ts">
interface GalleryImage {
  id: number
  url: string
  title: string
  alt_text?: string | null
  category?: string | null
  project?: string | null
  created_at: string
}

defineProps<{
  selectedImage: number | null
  imageData: GalleryImage | null | undefined
  images: GalleryImage[]
  getCategoryLabel: (category: string) => string
  t: (key: string) => string
}>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="selectedImage && imageData"
      @click="emit('close')"
      class="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
    >
      <div class="relative max-w-6xl w-full max-h-[90vh]">
        <!-- Close Button -->
        <button
          @click="emit('close')"
          class="absolute top-6 right-6 z-20 text-white hover:text-[#FFCD4B] transition-colors"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Navigation Buttons -->
        <button
          @click.stop="emit('prev')"
          class="absolute left-6 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FFCD4B] transition-colors"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          @click.stop="emit('next')"
          class="absolute right-6 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FFCD4B] transition-colors"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <!-- Image Container -->
        <div @click.stop class="lightbox-content bg-white overflow-hidden shadow-2xl">
          <!-- Large Image -->
          <div class="relative aspect-video bg-zinc-100">
            <img
              :src="imageData.url"
              :alt="imageData.alt_text || 'Gallery image'"
              class="w-full h-full object-cover"
            />

            <!-- Image Counter -->
            <div
              class="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-sm text-white text-sm font-light"
            >
              {{ images.findIndex((item) => item.id === selectedImage) + 1 }} /
              {{ images.length }}
            </div>
          </div>

          <!-- Image Info -->
          <div class="p-8">
            <div class="flex items-start justify-between mb-6">
              <div class="flex-1">
                <h2 class="text-3xl font-light text-zinc-900 mb-3">
                  {{ imageData.title }}
                </h2>
                <div class="flex items-center gap-4 text-zinc-600">
                  <span v-if="imageData.project" class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {{ imageData.project }}
                  </span>
                  <span v-if="imageData.category" class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    {{ getCategoryLabel(imageData.category) }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-zinc-400 mb-1 font-light">
                  {{ t('gallery.created') }}
                </div>
                <div class="text-zinc-700 font-light">
                  {{
                    new Date(imageData.created_at).toLocaleDateString('ka-GE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-4 pt-6 border-t border-zinc-200">
              <button
                @click="emit('close')"
                class="px-6 py-3 bg-zinc-100 text-zinc-700 font-light transition-all duration-300 hover:bg-zinc-200"
              >
                {{ t('gallery.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
