import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
  delay?: number
}

/**
 * Composable for scroll-based animations using Intersection Observer
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true,
    delay = 0,
  } = options

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
              timeoutId = window.setTimeout(() => {
                isVisible.value = true
              }, delay)
            } else {
              isVisible.value = true
            }

            if (once && observer) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            isVisible.value = false
            if (timeoutId) {
              clearTimeout(timeoutId)
              timeoutId = null
            }
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element.value)
  }

  // Watch for element assignment
  watch(element, (newElement) => {
    if (newElement && !observer) {
      nextTick(() => {
        observeElement()
      })
    }
  })

  onMounted(() => {
    // Try to observe immediately if element is already set
    nextTick(() => {
      observeElement()
    })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return {
    element,
    isVisible,
  }
}

/**
 * Parallax scroll effect composable
 */
export function useParallax(speed: number = 0.5) {
  const translateY = ref(0)
  const element = ref<HTMLElement | null>(null)

  const handleScroll = () => {
    if (!element.value) return

    const rect = element.value.getBoundingClientRect()
    const scrolled = window.scrollY
    const elementTop = rect.top + scrolled
    const windowHeight = window.innerHeight

    // Only apply parallax when element is in viewport
    if (rect.top < windowHeight && rect.bottom > 0) {
      translateY.value = (scrolled - elementTop + windowHeight) * speed
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    element,
    translateY,
  }
}

/**
 * Reveal on scroll with stagger effect for multiple elements
 */
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
              setTimeout(() => {
                visibleItems.value.add(index)
              }, index * staggerDelay)

              if (observer) {
                observer.unobserve(entry.target)
              }
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
      }
    )

    elements.value.forEach((el) => {
      if (el) {
        observer?.observe(el)
      }
    })
  }

  onMounted(() => {
    observeElements()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  const isItemVisible = (index: number) => visibleItems.value.has(index)

  return {
    elements,
    visibleItems,
    isItemVisible,
  }
}

/**
 * Smooth scroll to element
 */
export function useSmoothScroll() {
  const scrollToElement = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId)
    if (!element) return

    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }

  return {
    scrollToElement,
  }
}
