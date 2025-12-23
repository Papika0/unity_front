/**
 * Stagger Animation Composable
 * Reveal elements with staggered timing
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useStaggerAnimation(itemCount: number, staggerDelay: number = 100) {
  const visibleItems = ref<Set<number>>(new Set())
  const elements = ref<(HTMLElement | null)[]>([])
  let observer: IntersectionObserver | null = null

  const observeElements = () => {
    if (elements.value.length === 0) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = elements.value.indexOf(entry.target as HTMLElement)
            if (index !== -1) {
              setTimeout(() => { visibleItems.value.add(index) }, index * staggerDelay)
              if (observer) observer.unobserve(entry.target)
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px' }
    )

    elements.value.forEach((el) => { if (el) observer?.observe(el) })
  }

  onMounted(() => observeElements())
  onUnmounted(() => { if (observer) observer.disconnect() })

  const isItemVisible = (index: number) => visibleItems.value.has(index)

  return { elements, visibleItems, isItemVisible }
}
