<template>
  <div class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="$emit('back')"
          class="p-2 hover:bg-gray-100 rounded transition-colors"
          title="უკან დაბრუნება"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">შენობის ბლოკების რედაქტორი</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ selectedProject?.title || 'პროექტი' }} - ზონების ხატვა
          </p>
        </div>
        <ZoneEditorBreadcrumbs class="ml-4" />
      </div>

      <div class="flex items-center space-x-3">
        <!-- Unsaved Changes Badge -->
        <Transition name="fade">
          <div
            v-if="hasChanges && !isSaving"
            class="px-3 py-1 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg text-sm font-medium flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>შეუნახავი ცვლილებები</span>
          </div>
        </Transition>

        <!-- Last Draft Saved Indicator -->
        <div v-if="lastSavedTime" class="text-xs text-gray-500 flex items-center space-x-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>ბოლო დრაფტი: {{ lastSavedTime }}</span>
        </div>

        <!-- Keyboard Shortcut Hint -->
        <div class="text-xs text-gray-500 hidden lg:flex items-center space-x-1">
          <kbd class="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+S</kbd>
          <span>შენახვა</span>
        </div>

        <button
          @click="$emit('openImage')"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span class="hidden md:inline">სურათის ატვირთვა</span>
        </button>

        <!-- Discard Changes Button -->
        <button
          @click="$emit('discard')"
          :disabled="!hasChanges || isSaving"
          class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          title="ცვლილებების გაუქმება და ბოლო შენახული მდგომარეობის აღდგენა"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="hidden md:inline">გაუქმება</span>
        </button>

        <button
          @click="$emit('save')"
          :disabled="!hasChanges || isSaving"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <svg
            v-if="!isSaving"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span class="hidden md:inline">{{ isSaving ? 'შენახვა...' : 'შენახვა' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import type { Project } from '@/types'
import ZoneEditorBreadcrumbs from '@/components/admin/ZoneEditorBreadcrumbs.vue'

defineProps<{
  selectedProject: Project | undefined
  hasChanges: boolean
  isSaving: boolean
  lastSavedTime: string | null
}>()

defineEmits<{
  (e: 'back'): void
  (e: 'discard'): void
  (e: 'save'): void
  (e: 'openImage'): void
}>()
</script>
