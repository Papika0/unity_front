import { computed } from 'vue'
import { useHomepageStore } from '@/stores/public/homepage'

export interface AboutInfo {
  stats: {
    successful_projects: string
    years_experience: string
    satisfied_clients: string
    client_satisfaction: string
  }
}

export function useAboutInfo() {
  const homepageStore = useHomepageStore()

  const aboutInfo = computed((): AboutInfo | null => {
    const aboutData = homepageStore.aboutInfo
    return aboutData || null
  })

  const stats = computed(() => {
    return (
      aboutInfo.value?.stats || {
        successful_projects: '150+',
        years_experience: '15+',
        satisfied_clients: '50+',
        client_satisfaction: '98%',
      }
    )
  })

  return {
    aboutInfo,
    stats,
  }
}
