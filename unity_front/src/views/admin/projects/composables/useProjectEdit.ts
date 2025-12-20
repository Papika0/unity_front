/**
 * useProjectEdit - Composable for admin project edit view
 * Handles loading existing project data, form handling, and updates
 */

import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import { useProjectForm } from '@/composables/useProjectForm'

export function useProjectEdit() {
  // ============================================
  // STORES & ROUTER
  // ============================================
  const route = useRoute()
  const router = useRouter()
  const adminProjectsStore = useAdminProjectsStore()
  const id = Number(route.params.id)

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // ============================================
  // BASE COMPOSABLE
  // ============================================
  const {
    submitting,
    translating,
    createInitialForm,
    createInitialPreviews,
    handleTranslate: baseHandleTranslate,
    handleFileChange: baseHandleFileChange,
    handleGalleryChange: baseHandleGalleryChange,
    removeGalleryImage: baseRemoveGalleryImage,
    prepareFormData,
    loadProjectData,
  } = useProjectForm()

  // ============================================
  // STATE
  // ============================================
  const form = reactive(createInitialForm(true))
  const previews = reactive(createInitialPreviews())

  // ============================================
  // NAVIGATION
  // ============================================
  function goBack() {
    router.push({ name: 'admin-project-detail', params: { id } })
  }

  // ============================================
  // DATA LOADING
  // ============================================
  async function load() {
    try {
      const result = await adminProjectsStore.fetchProject(id)
      if (result.success && result.data) {
        loadProjectData(form, previews, result.data as unknown as Record<string, unknown>, backendUrl)
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  }

  // ============================================
  // FORM HANDLERS
  // ============================================
  function updateForm(updatedForm: Partial<typeof form>) {
    Object.assign(form, updatedForm)
  }

  function handleTranslate(fieldName: string, fromLang: string, toLang: string) {
    baseHandleTranslate(form, fieldName, fromLang, toLang)
  }

  function handleFileChange(fieldName: 'main_image' | 'render_image', files: FileList | null) {
    baseHandleFileChange(form, previews, fieldName, files)
  }

  function handleGalleryChange(files: FileList | null) {
    baseHandleGalleryChange(form, previews, files, true)
  }

  function removeGalleryImage(index: number) {
    baseRemoveGalleryImage(form, previews, index, true)
  }

  // ============================================
  // SUBMIT
  // ============================================
  async function onSubmit() {
    try {
      submitting.value = true
      const formData = await prepareFormData(form, true)

      const result = await adminProjectsStore.editProject(id, formData)
      if (result.success) {
        router.push({ name: 'admin-project-detail', params: { id } })
      } else {
        console.error('Update failed:', result.error)
      }
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      submitting.value = false
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(load)

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    form,
    previews,
    submitting,
    translating,
    backendUrl,

    // Navigation
    goBack,

    // Form handlers
    updateForm,
    handleTranslate,
    handleFileChange,
    handleGalleryChange,
    removeGalleryImage,
    onSubmit,
  }
}
