import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface ProjectTranslation {
  ka: string
  en: string
}

export interface Project {
  id: number
  is_active: boolean
  is_featured: boolean
  title: ProjectTranslation
  description: ProjectTranslation
  location: ProjectTranslation
  status: 'planning' | 'ongoing' | 'completed'
  start_date: string | null
  completion_date: string | null
  main_image: string
  render_image: string
  gallery_images: string[]
  year: number
  latitude: number | null
  longitude: number | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([
    {
      id: 1,
      is_active: true,
      is_featured: true,
      title: {
        ka: 'uniTY ბალანსი',
        en: 'uniTY Balance',
      },
      description: {
        ka: 'ვქმნით და ვაშენებთ გარემოს, სადაც ბალანსია, ზომიერება და ჰარმონია მიზანია. თანამედროვე დიზაინი და ეკოლოგიური მიდგომა.',
        en: 'We create and build an environment where balance, moderation and harmony are the goal. Modern design and ecological approach.',
      },
      location: {
        ka: 'ტბილისი, ვაკე, ზურაბ ჟვანიას ქუჩა 15',
        en: 'Tbilisi, Vake, Zurab Zhvania Street 15',
      },
      status: 'ongoing',
      start_date: '2024-03-15',
      completion_date: '2025-12-20',
      main_image: '/images/projects/unity-balance-main.jpg',
      render_image: '/images/projects/unity-balance-render.jpg',
      gallery_images: [
        '/images/projects/unity-balance-1.jpg',
        '/images/projects/unity-balance-2.jpg',
        '/images/projects/unity-balance-3.jpg',
        '/images/projects/unity-balance-4.jpg',
      ],
      year: 2025,
      latitude: 41.7151,
      longitude: 44.7661,
      meta_title: 'uniTY ბალანსი - თანამედროვე საცხოვრებელი კომპლექსი',
      meta_description:
        'თანამედროვე საცხოვრებელი კომპლექსი ვაკეში, ეკოლოგიური მიდგომით და ბალანსირებული დიზაინით.',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-07-10T14:20:00Z',
    },
    {
      id: 2,
      is_active: true,
      is_featured: false,
      title: {
        ka: 'uniTY ჰარმონია',
        en: 'uniTY Harmony',
      },
      description: {
        ka: 'ელიტური საცხოვრებელი კომპლექსი ქალაქის ცენტრში. უნიკალური არქიტექტურა და ყველა თანამედროვე კომფორტი.',
        en: 'Elite residential complex in the city center. Unique architecture and all modern comforts.',
      },
      location: {
        ka: 'ტბილისი, საბურთალო, პეკინის ქუჩა 28',
        en: 'Tbilisi, Saburtalo, Peking Street 28',
      },
      status: 'completed',
      start_date: '2023-01-10',
      completion_date: '2024-06-30',
      main_image: '/images/projects/unity-harmony-main.jpg',
      render_image: '/images/projects/unity-harmony-render.jpg',
      gallery_images: [
        '/images/projects/unity-harmony-1.jpg',
        '/images/projects/unity-harmony-2.jpg',
        '/images/projects/unity-harmony-3.jpg',
      ],
      year: 2024,
      latitude: 41.7352,
      longitude: 44.7861,
      meta_title: 'uniTY ჰარმონია - ელიტური საცხოვრებელი კომპლექსი',
      meta_description: 'ელიტური საცხოვრებელი კომპლექსი საბურთალოში, უნიკალური არქიტექტურით.',
      created_at: '2023-01-05T09:15:00Z',
      updated_at: '2024-06-30T16:45:00Z',
    },
    {
      id: 3,
      is_active: true,
      is_featured: false,
      title: {
        ka: 'uniTY ორიონი',
        en: 'uniTY Orion',
      },
      description: {
        ka: 'თანამედროვე ოფისური კომპლექსი ბიზნეს ცენტრში. ინოვაციური გადაწყვეტები და მაღალი სტანდარტები.',
        en: 'Modern office complex in the business center. Innovative solutions and high standards.',
      },
      location: {
        ka: 'ტბილისი, ისანი, ბაქოს ქუჩა 7',
        en: 'Tbilisi, Isani, Bako Street 7',
      },
      status: 'planning',
      start_date: '2025-02-01',
      completion_date: null,
      main_image: '/images/projects/unity-orion-main.jpg',
      render_image: '/images/projects/unity-orion-render.jpg',
      gallery_images: ['/images/projects/unity-orion-1.jpg', '/images/projects/unity-orion-2.jpg'],
      year: 2026,
      latitude: 41.7225,
      longitude: 44.8087,
      meta_title: 'uniTY ორიონი - თანამედროვე ოფისური კომპლექსი',
      meta_description: 'თანამედროვე ოფისური კომპლექსი ისანში, ინოვაციური გადაწყვეტებით.',
      created_at: '2024-06-01T11:00:00Z',
      updated_at: '2024-07-01T09:30:00Z',
    },
    {
      id: 4,
      is_active: true,
      is_featured: false,
      title: {
        ka: 'uniTY პარკვიუ',
        en: 'uniTY Parkview',
      },
      description: {
        ka: 'ბუნებასთან ახლოს მდებარე საცხოვრებელი კომპლექსი. პარკული ზონები და მწვანე ტერიტორიები.',
        en: 'Residential complex located close to nature. Park areas and green territories.',
      },
      location: {
        ka: 'ტბილისი, ვაზისუბანი, ნუცუბიძის ქუჩა 42',
        en: 'Tbilisi, Vazissubani, Nutsubidze Street 42',
      },
      status: 'ongoing',
      start_date: '2024-05-20',
      completion_date: '2026-03-15',
      main_image: '/images/projects/unity-parkview-main.jpg',
      render_image: '/images/projects/unity-parkview-render.jpg',
      gallery_images: [
        '/images/projects/unity-parkview-1.jpg',
        '/images/projects/unity-parkview-2.jpg',
        '/images/projects/unity-parkview-3.jpg',
        '/images/projects/unity-parkview-4.jpg',
        '/images/projects/unity-parkview-5.jpg',
      ],
      year: 2026,
      latitude: 41.7456,
      longitude: 44.8156,
      meta_title: 'uniTY პარკვიუ - ბუნებრივ გარემოში საცხოვრებელი კომპლექსი',
      meta_description:
        'საცხოვრებელი კომპლექსი ვაზისუბანში, პარკული ზონებით და მწვანე ტერიტორიებით.',
      created_at: '2024-04-15T14:20:00Z',
      updated_at: '2024-07-08T10:15:00Z',
    },
    {
      id: 5,
      is_active: true,
      is_featured: false,
      title: {
        ka: 'uniTY ზენითი',
        en: 'uniTY Zenith',
      },
      description: {
        ka: 'მაღალსართულიანი საცხოვრებელი კომპლექსი პანორამული ხედებით. ლუქსუსი და კომფორტი ერთად.',
        en: 'High-rise residential complex with panoramic views. Luxury and comfort combined.',
      },
      location: {
        ka: 'ტბილისი, ჩუღურეთი, ალექსანდრე ყაზბეგის ქუჩა 19',
        en: 'Tbilisi, Chughureti, Alexandre Kazbegi Street 19',
      },
      status: 'completed',
      start_date: '2022-08-01',
      completion_date: '2024-04-15',
      main_image: '/images/projects/unity-zenith-main.jpg',
      render_image: '/images/projects/unity-zenith-render.jpg',
      gallery_images: [
        '/images/projects/unity-zenith-1.jpg',
        '/images/projects/unity-zenith-2.jpg',
        '/images/projects/unity-zenith-3.jpg',
      ],
      year: 2024,
      latitude: 41.6941,
      longitude: 44.8337,
      meta_title: 'uniTY ზენითი - მაღალსართულიანი საცხოვრებელი კომპლექსი',
      meta_description: 'მაღალსართულიანი საცხოვრებელი კომპლექსი ჩუღურეთში, პანორამული ხედებით.',
      created_at: '2022-06-10T13:45:00Z',
      updated_at: '2024-04-15T17:30:00Z',
    },
    {
      id: 6,
      is_active: true,
      is_featured: false,
      title: {
        ka: 'uniTY ეკო-სფერო',
        en: 'uniTY Eco-Sphere',
      },
      description: {
        ka: 'ეკოლოგიური საცხოვრებელი კომპლექსი მუხათწარში. მდგრადი განვითარება და ბუნებრივი მასალები.',
        en: 'Ecological residential complex in Mukhiatgvari. Sustainable development and natural materials.',
      },
      location: {
        ka: 'ტბილისი, მუხათწარი, ღია ჰაერის ქუჩა 5',
        en: 'Tbilisi, Mukhiatgvari, Open Air Street 5',
      },
      status: 'ongoing',
      start_date: '2024-09-01',
      completion_date: '2026-08-30',
      main_image: '/images/projects/unity-eco-sphere-main.jpg',
      render_image: '/images/projects/unity-eco-sphere-render.jpg',
      gallery_images: [
        '/images/projects/unity-eco-sphere-1.jpg',
        '/images/projects/unity-eco-sphere-2.jpg',
      ],
      year: 2026,
      latitude: 41.6825,
      longitude: 44.7156,
      meta_title: 'uniTY ეკო-სფერო - ეკოლოგიური საცხოვრებელი კომპლექსი',
      meta_description: 'ეკოლოგიური საცხოვრებელი კომპლექსი მუხათწარში, მდგრადი განვითარებით.',
      created_at: '2024-07-01T08:00:00Z',
      updated_at: '2024-07-10T12:00:00Z',
    },
  ])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeProjects = computed(() => projects.value.filter((project) => project.is_active))

  const featuredProjects = computed(() =>
    projects.value.filter((project) => project.is_featured && project.is_active),
  )

  const ongoingProjects = computed(() =>
    projects.value.filter((project) => project.status === 'ongoing' && project.is_active),
  )

  const completedProjects = computed(() =>
    projects.value.filter((project) => project.status === 'completed' && project.is_active),
  )

  const plannedProjects = computed(() =>
    projects.value.filter((project) => project.status === 'planning' && project.is_active),
  )

  const projectsByYear = computed(() => {
    const grouped: Record<number, Project[]> = {}
    activeProjects.value.forEach((project) => {
      if (!grouped[project.year]) {
        grouped[project.year] = []
      }
      grouped[project.year].push(project)
    })
    return grouped
  })

  // Actions
  const getProjectById = (id: number): Project | undefined => {
    return projects.value.find((project) => project.id === id && project.is_active)
  }

  const getProjectsByStatus = (status: Project['status']): Project[] => {
    return projects.value.filter((project) => project.status === status && project.is_active)
  }

  const searchProjects = (query: string, lang: 'ka' | 'en' = 'ka'): Project[] => {
    const lowercaseQuery = query.toLowerCase()
    return projects.value.filter(
      (project) =>
        project.is_active &&
        (project.title[lang].toLowerCase().includes(lowercaseQuery) ||
          project.description[lang].toLowerCase().includes(lowercaseQuery) ||
          project.location[lang].toLowerCase().includes(lowercaseQuery)),
    )
  }

  // Future API integration methods
  const fetchProjects = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/api/projects')
      // projects.value = response.data

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err) {
      error.value = 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchProjectById = async (id: number): Promise<Project | null> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/api/projects/${id}`)
      // return response.data

      // For now, return from local data
      const project = getProjectById(id)
      return project || null
    } catch (err) {
      error.value = 'Failed to fetch project'
      console.error('Error fetching project:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    projects,
    isLoading,
    error,

    // Getters
    activeProjects,
    featuredProjects,
    ongoingProjects,
    completedProjects,
    plannedProjects,
    projectsByYear,

    // Actions
    getProjectById,
    getProjectsByStatus,
    searchProjects,
    fetchProjects,
    fetchProjectById,
  }
})
