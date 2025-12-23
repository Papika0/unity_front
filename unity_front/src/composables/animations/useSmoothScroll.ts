/**
 * Smooth Scroll Composable
 * Programmatic smooth scrolling to elements
 */

export function useSmoothScroll() {
  const scrollToElement = (elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId)
    if (!element) return

    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - offset

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }

  return { scrollToElement }
}
