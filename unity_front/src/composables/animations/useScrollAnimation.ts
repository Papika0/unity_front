/**
 * Scroll Animation Composable
 * Visibility detection using Intersection Observer
 */

import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
  delay?: number
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', once = true, delay = 0 } = options

  const isVisible = ref(false)
  const element = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null
  let timeoutId: number | null = null

  const observeElement = () => {
    if (!element.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              timeoutId = window.setTimeout(() => { isVisible.value = true }, delay)
            } else {
              isVisible.value = true
            }
            if (once && observer) observer.unobserve(entry.target)
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

  watch(element, (newElement) => {
    if (newElement && !observer) nextTick(() => observeElement())
  })

  onMounted(() => nextTick(() => observeElement()))
  onUnmounted(() => {
    if (observer) observer.disconnect()
    if (timeoutId) clearTimeout(timeoutId)
  })

  return { element, isVisible }
}
