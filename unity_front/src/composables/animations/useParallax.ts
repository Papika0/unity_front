/**
 * Parallax Scroll Composable
 * Smooth parallax effect based on scroll position
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useParallax(speed: number = 0.5) {
  const translateY = ref(0)
  const element = ref<HTMLElement | null>(null)

  const handleScroll = () => {
    if (!element.value) return

    const rect = element.value.getBoundingClientRect()
    const scrolled = window.scrollY
    const elementTop = rect.top + scrolled
    const windowHeight = window.innerHeight

    if (rect.top < windowHeight && rect.bottom > 0) {
      translateY.value = (scrolled - elementTop + windowHeight) * speed
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return { element, translateY }
}
