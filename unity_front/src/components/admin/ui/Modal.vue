<template>
  <teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div
        class="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-auto transform transition-all duration-300 scale-100 my-8"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-8 border-b border-slate-200">
          <h2
            class="text-3xl font-light bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tight"
          >
            {{ title }}
          </h2>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-2 hover:bg-slate-100"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-8 max-h-[60vh] overflow-y-auto">
          <slot />
        </div>

        <!-- Modal Footer -->
        <div v-if="$slots.footer" class="px-8 py-6 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

function closeModal() {
  emit('close')
}

// Close modal on escape key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// Add/remove escape key listener when modal shows/hides
watchEffect(() => {
  if (props.show) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<script lang="ts">
import { watchEffect, onUnmounted, defineComponent } from 'vue'

export default defineComponent({
  name: 'AdminModal'
})
</script>
