<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('cancel')"
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
            <strong class="text-slate-900">"{{ articleTitle }}"</strong>
            სიახლის წაშლა?
          </p>
        </div>

        <div class="flex gap-4">
          <button
            @click="$emit('cancel')"
            :disabled="saving"
            class="flex-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 px-6 py-3 rounded-2xl hover:from-slate-200 hover:to-slate-100 transition-all duration-300 font-medium disabled:opacity-50 border border-slate-200"
          >
            გაუქმება
          </button>
          <button
            @click="$emit('confirm')"
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
</template>

<script setup lang="ts">

defineProps<{
  show: boolean
  articleTitle: string
  saving: boolean
}>()

defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()
</script>
