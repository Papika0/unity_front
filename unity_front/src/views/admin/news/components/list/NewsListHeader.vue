<template>
  <section class="relative bg-white border-b border-slate-100 py-8 sm:py-12 lg:py-16">
    <div class="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-slate-50/30"></div>

    <div class="relative max-w-7xl mx-auto px-4 md:px-8">
      <div class="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div class="flex-1">
          <div class="mb-3 sm:mb-4">
            <div
              class="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-4 sm:mb-6"
            ></div>
          </div>
          <h1
            class="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent break-words leading-tight py-1"
          >
            სიახლეები
          </h1>
          <p class="mt-2 text-slate-600 text-sm sm:text-base md:text-lg">
            სიახლეების მართვა, შექმნა, რედაქტირება და წაშლა.
          </p>
          <div
            class="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-4 sm:mt-6"
          ></div>
        </div>

        <div class="flex-shrink-0 flex flex-col gap-2 sm:gap-3">
          <button
            @click="$emit('addNews')"
            class="group bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300"
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

          <button
            @click="$emit('openFeaturedModal')"
            class="group bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300"
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
            რჩეული სიახლეები
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'addNews'): void
  (e: 'openFeaturedModal'): void
}>()
</script>
