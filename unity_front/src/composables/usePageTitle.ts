import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTranslations } from './useTranslations'

// Map route names to translation keys for page titles
const routeTitleMap: Record<string, string> = {
  'home': 'header.home',
  'about': 'header.about',
  'projects': 'header.projects',
  'project-detail': 'header.projects',
  'news': 'header.news',
  'news-detail': 'header.news',
  'gallery': 'header.gallery',
  'contact': 'header.contact',
  'admin-dashboard': 'Dashboard',
  'admin-news': 'News Management',
  'admin-projects': 'Projects Management',
  'admin-features': 'Features Management',
  'admin-translations': 'Translations Management',
  'admin-contact-info': 'Contact Info',
  'admin-gallery': 'Gallery Management',
  'admin-about': 'About Settings',
  'admin-customers': 'Customers',
}

export function usePageTitle() {
  const route = useRoute()
  const { t, currentLocale } = useTranslations()

  // Function to update the page title
  const updateTitle = () => {
    const routeName = route.name as string
    const titleKey = routeTitleMap[routeName]
    
    if (titleKey) {
      // Check if it's a translation key (contains a dot)
      if (titleKey.includes('.')) {
        const translatedTitle = t(titleKey)
        // Only update if we got a translation (not the key itself)
        if (translatedTitle && translatedTitle !== titleKey) {
          document.title = `${translatedTitle} | Unity`
        } else {
          document.title = 'Unity Development'
        }
      } else {
        // Static title (for admin pages)
        document.title = `${titleKey} | Unity`
      }
    } else {
      document.title = 'Unity Development'
    }
  }

  // Watch for route changes
  watch(() => route.name, () => {
    updateTitle()
  }, { immediate: true })

  // Watch for locale changes
  watch(() => currentLocale, () => {
    updateTitle()
  })

  return {
    updateTitle,
  }
}
