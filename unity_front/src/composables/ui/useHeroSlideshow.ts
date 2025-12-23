/**
 * useHeroSlideshow Composable
 * Handles slideshow navigation, auto-scroll, and keyboard controls
 */

import { ref, type Ref, onMounted, onUnmounted } from 'vue'

export interface HeroSlideshowOptions {
  /** Interval in ms between auto-slide (default: 8000) */
  interval?: number
  /** Animation duration in ms (default: 1800) */
  animationDuration?: number
}

export function useHeroSlideshow(
  totalSlides: Ref<number>,
  heroRef: Ref<HTMLElement | undefined>,
  options: HeroSlideshowOptions = {}
) {
  const { interval = 8000, animationDuration = 1800 } = options

  // ==================== STATE ====================
  const currentSlide = ref(0)
  const previousSlide = ref(-1)
  const isAnimating = ref(false)
  const isPaused = ref(false)
  const hasInitiallyLoaded = ref(false)
  const scrollProgress = ref(0)
  const slideDirection = ref<'next' | 'prev'>('next')
  const isInView = ref(false)

  let slideInterval: number | null = null

  // ==================== SCROLL TRACKING ====================
  const handleScroll = () => {
    if (!heroRef.value) return
    
    const rect = heroRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const progress = Math.max(0, Math.min(1, -rect.top / windowHeight))
    scrollProgress.value = progress
  }

  // ==================== AUTO-SCROLL ====================
  const startAutoScroll = () => {
    if (slideInterval || isPaused.value || totalSlides.value <= 1) return

    slideInterval = window.setInterval(() => {
      if (!isPaused.value && !isAnimating.value) {
        nextSlide()
      }
    }, interval)
  }

  const stopAutoScroll = () => {
    if (slideInterval) {
      clearInterval(slideInterval)
      slideInterval = null
    }
  }

  // ==================== NAVIGATION ====================
  const nextSlide = () => {
    if (isAnimating.value) return
    isAnimating.value = true
    previousSlide.value = currentSlide.value
    slideDirection.value = 'next'
    currentSlide.value = (currentSlide.value + 1) % totalSlides.value
    setTimeout(() => {
      isAnimating.value = false
    }, animationDuration)
  }

  const prevSlide = () => {
    if (isAnimating.value) return
    isAnimating.value = true
    previousSlide.value = currentSlide.value
    slideDirection.value = 'prev'
    currentSlide.value =
      currentSlide.value === 0 ? totalSlides.value - 1 : currentSlide.value - 1
    setTimeout(() => {
      isAnimating.value = false
    }, animationDuration)
  }

  const pauseAutoScroll = () => {
    isPaused.value = true
  }

  const resumeAutoScroll = () => {
    isPaused.value = false
    if (!slideInterval) {
      startAutoScroll()
    }
  }

  // ==================== KEYBOARD NAVIGATION ====================
  const handleKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        prevSlide()
        break
      case 'ArrowRight':
        event.preventDefault()
        nextSlide()
        break
      case ' ':
        event.preventDefault()
        if (isPaused.value) {
          resumeAutoScroll()
        } else {
          pauseAutoScroll()
        }
        break
    }
  }

  // ==================== INTERSECTION OBSERVER ====================
  const setupIntersectionObserver = () => {
    if (!heroRef.value) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInView.value = entry.isIntersecting
          if (entry.isIntersecting) {
            startAutoScroll()
          } else {
            stopAutoScroll()
          }
        })
      },
      { threshold: 0.5 },
    )

    observer.observe(heroRef.value)

    return () => observer.disconnect()
  }

  // ==================== LIFECYCLE ====================
  onMounted(() => {
    setTimeout(() => {
      hasInitiallyLoaded.value = true
    }, 100)

    setupIntersectionObserver()
    document.addEventListener('keydown', handleKeydown)
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    stopAutoScroll()
    document.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('scroll', handleScroll)
  })

  // ==================== RETURN ====================
  return {
    // State
    currentSlide,
    previousSlide,
    isAnimating,
    isPaused,
    hasInitiallyLoaded,
    scrollProgress,
    slideDirection,
    isInView,
    // Actions
    nextSlide,
    prevSlide,
    pauseAutoScroll,
    resumeAutoScroll,
    startAutoScroll,
    stopAutoScroll,
  }
}
