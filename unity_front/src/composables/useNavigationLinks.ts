import { computed, ref, onMounted } from 'vue'
import { useTranslations } from './useTranslations'
import { useFooterStore } from '@/stores/public/footer'

// Simple type for navigation project data
interface NavigationProject {
  id: number
  title: string
}

export function useNavigationLinks() {
  const { t } = useTranslations()
  const footerStore = useFooterStore()
  const loadingProjects = ref(false)

  // Function to ensure footer data (including projects) is loaded
  const ensureFooterDataLoaded = async () => {
    if (loadingProjects.value) return // Prevent multiple simultaneous loads

    // Always try to load if we don't have data, regardless of loading state
    if (!footerStore.isFetched || footerStore.isDataEmpty) {
      loadingProjects.value = true
      try {
        await footerStore.loadFooterData()
      } catch (error) {
        console.error('Failed to load footer data in navigation:', error)
      } finally {
        loadingProjects.value = false
      }
    }
  }

  // Load footer data when composable is initialized
  onMounted(async () => {
    await ensureFooterDataLoaded()
  })

  const mainNavigation = computed(() => [
    { key: 'header.home', path: '/', label: t('header.home') },
    { key: 'header.about', path: '/about', label: t('header.about') },
    { key: 'header.projects', path: '/projects', label: t('header.projects') },
    { key: 'header.gallery', path: '/gallery', label: t('header.gallery') },
    { key: 'header.contact', path: '/contact', label: t('header.contact') },
  ])

  const businessLinks = computed(() => [
    { key: 'footer.home', path: '/', label: t('header.home') },
    { key: 'footer.about', path: '/about', label: t('header.about') },
    { key: 'footer.media', path: '/gallery', label: t('header.gallery') },
    { key: 'footer.contact', path: '/contact', label: t('header.contact') },
    { key: 'footer.terms', path: '/terms', label: t('footer.terms') },
    { key: 'footer.privacy', path: '/privacy', label: t('footer.privacy') },
    { key: 'footer.cookies', path: '/cookies', label: t('footer.cookies') },
  ])

  const projectLinks = computed(() => {
    // Return empty array if no projects data yet
    if (!footerStore.projects || footerStore.projects.length === 0) {
      return []
    }

    return footerStore.projects.slice(0, 6).map((project: NavigationProject) => ({
      key: `project-${project.id}`,
      id: project.id,
      label: project.title,
      path: `/projects/${project.id}`,
    }))
  })

  const socialLinks = computed(() => {
    const social = footerStore.socialLinks
    const links = []

    // Return empty array if no social data yet
    if (!social) {
      return []
    }

    // Add null check to prevent accessing properties of null
    if (social.facebook) {
      links.push({
        key: 'footer.facebook',
        href: social.facebook,
        label: 'Facebook',
        external: true,
      })
    }

    if (social.instagram) {
      links.push({
        key: 'footer.instagram',
        href: social.instagram,
        label: 'Instagram',
        external: true,
      })
    }
    return links
  })

  return {
    mainNavigation,
    businessLinks,
    projectLinks,
    socialLinks,
  }
}
