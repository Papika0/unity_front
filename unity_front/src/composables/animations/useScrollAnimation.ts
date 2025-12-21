/**
 * Scroll Animation Composable
 * Provides scroll-triggered animation functionality with IntersectionObserver
 */

import { ref, onMounted, onUnmounted, watch, nextTick, type Ref } from 'vue'

export interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
  delay?: number
}

/**
 * Creates a scroll-triggered animation observer
 * Returns an element ref and visibility state
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', once = true, delay = 0 } = options
  const element: Ref<HTMLElement | null> = ref(null)
  const isVisible = ref(false)

  let observer: IntersectionObserver | null = null
  let timeoutId: number | null = null

  const observeElement = () => {
    if (!element.value) return
    
    // Clean up existing observer if any
    if (observer) {
      observer.disconnect()
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              timeoutId = window.setTimeout(() => { isVisible.value = true }, delay)
            } else {
              isVisible.value = true
            }
            if (once && observer) {
              observer.disconnect()
            }
          } else if (!once) {
            isVisible.value = false
            if (timeoutId) { clearTimeout(timeoutId); timeoutId = null }
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(element.value)
  }

  // Watch for element changes - critical for dynamically rendered components (Transitions)
  watch(element, (newElement) => {
    if (newElement && !observer) {
      nextTick(() => observeElement())
    }
  })

  onMounted(() => {
    nextTick(() => observeElement())
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return { element, isVisible }
}
