/**
 * useAbout - Composable for about page logic
 * Handles stats, values, and scroll animations
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useAboutInfo } from '@/composables/pages/useAboutInfo'
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'

export function useAbout() {
  // ============================================
  // COMPOSABLES
  // ============================================
  const { t } = useTranslations()
  const { aboutInfo, stats: aboutStats, loadAboutInfo, isLoading, error } = useAboutInfo()

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  const heroVisible = ref(false)

  const {
    element: philosophyTextRef,
    isVisible: philosophyTextVisible,
  } = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false })

  const {
    element: philosophyImageRef,
    isVisible: philosophyImageVisible,
  } = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false, delay: 150 })

  const {
    element: statsSectionRef,
    isVisible: statsSectionVisible,
  } = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false })

  const {
    element: valuesSectionRef,
    isVisible: valuesSectionVisible,
  } = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false })

  const {
    element: missionSectionRef,
    isVisible: missionVisible,
  } = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false })

  const {
    element: ctaSectionRef,
    isVisible: ctaVisible,
  } = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false })

  // ============================================
  // COMPUTED
  // ============================================
  const scrollProgress = computed(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    return (scrollTop / docHeight) * 100
  })

  const stats = computed(() => [
    { number: aboutStats.value.successful_projects, label: t('about.stats.successful_projects') },
    { number: aboutStats.value.years_experience, label: t('about.stats.years_experience') },
    { number: aboutStats.value.satisfied_clients, label: t('about.stats.satisfied_clients') },
    { number: aboutStats.value.client_satisfaction, label: t('about.stats.client_satisfaction') },
  ])

  const values = computed(() => [
    {
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.description'),
    },
    {
      title: t('about.values.quality.title'),
      description: t('about.values.quality.description'),
    },
    {
      title: t('about.values.sustainability.title'),
      description: t('about.values.sustainability.description'),
    },
    {
      title: t('about.values.exclusivity.title'),
      description: t('about.values.exclusivity.description'),
    },
  ])

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadAboutInfo()
    window.scrollTo(0, 0)
    setTimeout(() => {
      heroVisible.value = true
    }, 100)
  })

  onBeforeUnmount(() => {
    // Cleanup if needed
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Translations
    t,

    // About data
    aboutInfo,
    isLoading,
    error,
    loadAboutInfo,
    stats,
    values,

    // Scroll animations
    heroVisible,
    philosophyTextRef,
    philosophyTextVisible,
    philosophyImageRef,
    philosophyImageVisible,
    statsSectionRef,
    statsSectionVisible,
    valuesSectionRef,
    valuesSectionVisible,
    missionSectionRef,
    missionVisible,
    ctaSectionRef,
    ctaVisible,
    scrollProgress,
  }
}
