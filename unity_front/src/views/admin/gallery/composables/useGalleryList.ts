import { ref, computed, watch } from 'vue'
import { adminImageApi } from '@/services/adminImageApi'
import type { MultilingualText } from '@/services/contactApi'
import { useToast } from '@/composables/useToast'

export interface GalleryImage {
  id: number
  url: string
  title: string | MultilingualText
  project: string | null | MultilingualText
  alt_text: string | null | MultilingualText
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useGalleryList() {
  const toast = useToast()

  // State
  const images = ref<GalleryImage[]>([])
  const categories = ref<string[]>([])
  const projects = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const selectedProject = ref('')
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalImages = ref(0)

  // Modal states
  const showUploadModal = ref(false)
  const selectedImage = ref<GalleryImage | null>(null)
  const editingImage = ref<GalleryImage | null>(null)

  // Computed
  const activeImages = computed(() => images.value.filter((img) => img.is_active).length)
  
  const visiblePages = computed(() => {
    const pages = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (current > 4) pages.push('...')

      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (current < total - 3) pages.push('...')
      pages.push(total)
    }

    return pages
  })

  // Helpers
  const getGeorgianText = (value: string | null | MultilingualText): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return value.ka || ''
  }

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      exterior: 'ფასადები',
      interior: 'ინტერიერი',
      landscape: 'ლანდშაფტი',
      commercial: 'კომერციული',
      residential: 'საცხოვრებელი',
      about: 'ჩვენ შესახებ',
      projects: 'პროექტები',
      news: 'სიახლეები',
    }
    return labels[category] || category
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ka-GE')
  }

  // Actions
  const loadImages = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await adminImageApi.getImages(
        {
          category: selectedCategory.value,
          project: selectedProject.value,
          search: searchQuery.value,
          per_page: 15,
          page: currentPage.value,
        },
        true, // Include metadata
      )

      if (response.success) {
        images.value = response.data.data
        totalPages.value = response.data.last_page
        totalImages.value = response.data.total

        if (response.metadata) {
          categories.value = response.metadata.categories
          projects.value = response.metadata.projects
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load images'
      error.value = message
      toast.error(message)
      console.error('Failed to load images:', err)
    } finally {
      loading.value = false
    }
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = ''
    selectedProject.value = ''
    currentPage.value = 1
  }

  const refreshImages = () => {
    loadImages()
  }

  const openUploadModal = () => {
    showUploadModal.value = true
  }

  const viewImage = (image: GalleryImage) => {
    selectedImage.value = image
  }

  const editImage = (image: GalleryImage) => {
    editingImage.value = image
  }

  const deleteImage = async (image: GalleryImage) => {
    const title = getGeorgianText(image.title)
    if (confirm(`გსურთ წაშალოთ "${title}"?`)) {
      try {
        const response = await adminImageApi.deleteImage(image.id)
        if (response.success) {
          toast.success('სურათი წარმატებით წაიშალა')
          selectedImage.value = null
          loadImages()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'სურათის წაშლა ვერ მოხერხდა'
        toast.error(message)
        console.error('Failed to delete image:', err)
      }
    }
  }

  const handleImageUploaded = () => {
    showUploadModal.value = false
    toast.success('სურათი წარმატებით აიტვირთა')
    loadImages()
  }

  const handleImageUpdated = () => {
    editingImage.value = null
    toast.success('სურათი წარმატებით განახლდა')
    loadImages()
  }

  const changePage = (page: number) => {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Watchers
  watch([selectedCategory, selectedProject, searchQuery], () => {
    currentPage.value = 1
    loadImages()
  })
  
  watch(currentPage, () => {
    loadImages()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  return {
    images,
    categories,
    projects,
    loading,
    error,
    searchQuery,
    selectedCategory,
    selectedProject,
    currentPage,
    totalPages,
    totalImages,
    activeImages,
    visiblePages,
    
    showUploadModal,
    selectedImage,
    editingImage,
    
    getGeorgianText,
    getCategoryLabel,
    formatDate,
    
    loadImages,
    clearFilters,
    refreshImages,
    openUploadModal,
    viewImage,
    editImage,
    deleteImage,
    handleImageUploaded,
    handleImageUpdated,
    changePage
  }
}
