import { computed } from 'vue'
import { useTranslations } from './useTranslations'
import { useProjectsStore } from '@/stores/public/projects'

export function useNavigationLinks() {
  const { t } = useTranslations()
  const projectsStore = useProjectsStore()

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

  const projectLinks = computed(() =>
    projectsStore.activeProjects.slice(0, 6).map((project) => ({
      key: `project-${project.id}`,
      id: project.id,
      label: project.title,
      path: `/projects/${project.id}`,
    })),
  )

  const socialLinks = computed(() => [
    { key: 'footer.facebook', href: '#', label: t('footer.facebook'), external: true },
    { key: 'footer.instagram', href: '#', label: t('footer.instagram'), external: true },
    { key: 'footer.linkedin', href: '#', label: t('footer.linkedin'), external: true },
    { key: 'footer.youtube', href: '#', label: t('footer.youtube'), external: true },
  ])

  return {
    mainNavigation,
    businessLinks,
    projectLinks,
    socialLinks,
  }
}
