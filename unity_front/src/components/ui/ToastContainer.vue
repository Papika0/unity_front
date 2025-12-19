<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] space-y-3 max-w-sm">
      <TransitionGroup name="toast" tag="div" class="space-y-3">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="[
            'relative overflow-hidden rounded-2xl shadow-lg border backdrop-blur-sm transform transition-all duration-300',
            getToastClasses(toast.type),
          ]"
        >
          <!-- Toast Content -->
          <div class="p-4">
            <div class="flex items-start">
              <!-- Icon -->
              <div class="flex-shrink-0 mr-3">
                <component :is="getIconComponent(toast.type)" class="w-6 h-6" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-slate-900 mb-1">
                  {{ toast.title }}
                </h4>
                <p v-if="toast.message" class="text-sm text-slate-700">
                  {{ toast.message }}
                </p>
              </div>

              <!-- Close Button -->
              <button
                @click="toastStore.removeToast(toast.id)"
                class="flex-shrink-0 ml-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <!-- Progress Bar (for non-persistent toasts) -->
          <div
            v-if="!toast.persistent"
            class="absolute bottom-0 left-0 h-1 bg-current opacity-30"
            :style="{
              animation: `toast-progress ${toast.duration}ms linear forwards`,
            }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useToastStore } from '@/stores/ui/toast'

defineOptions({ name: 'ToastContainer' })

const toastStore = useToastStore()

const getToastClasses = (type: string) => {
  const classes = {
    success: 'bg-green-50/95 border-green-200 text-green-800',
    error: 'bg-red-50/95 border-red-200 text-red-800',
    warning: 'bg-amber-50/95 border-amber-200 text-amber-800',
    info: 'bg-blue-50/95 border-blue-200 text-blue-800',
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getIconComponent = (type: string) => {
  const icons = {
    success: () =>
      h(
        'svg',
        {
          class: 'w-6 h-6 text-green-600',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M5 13l4 4L19 7',
          }),
        ],
      ),
    error: () =>
      h(
        'svg',
        {
          class: 'w-6 h-6 text-red-600',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          }),
        ],
      ),
    warning: () =>
      h(
        'svg',
        {
          class: 'w-6 h-6 text-amber-600',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          }),
        ],
      ),
    info: () =>
      h(
        'svg',
        {
          class: 'w-6 h-6 text-blue-600',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          }),
        ],
      ),
  }
  return icons[type as keyof typeof icons] || icons.info
}
</script>

<style scoped>
/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Progress bar animation */
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
