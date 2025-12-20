/**
 * useProjectAdd - Composable for admin project add view
 * Handles form initialization, file handling, and project creation
 */

import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import { useProjectForm } from '@/composables/useProjectForm'

export function useProjectAdd() {
  // ============================================
  // STORES & ROUTER
  // ============================================
  const router = useRouter()
  const adminProjectsStore = useAdminProjectsStore()

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
  } = useProjectForm()

  // ============================================
  // STATE
  // ============================================
  const uploadProgress = ref(0)
  const isUploading = ref(false)
  const form = reactive(createInitialForm(false))
  const previews = reactive(createInitialPreviews())

  // ============================================
  // NAVIGATION
  // ============================================
  function goBack() {
    router.push({ name: 'admin-projects' })
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
    baseHandleGalleryChange(form, previews, files, false)
  }

  function removeGalleryImage(index: number) {
    baseRemoveGalleryImage(form, previews, index, false)
  }

  // ============================================
  // SUBMIT
  // ============================================
  async function onSubmit() {
    try {
      submitting.value = true
      isUploading.value = true
      uploadProgress.value = 0

      // Check if we need sequential upload (large payload)
      const allImageFiles = [form.main_image, form.render_image, ...form.gallery_images].filter(
        (file): file is File => file instanceof File,
      )
      const totalSize = allImageFiles.reduce((sum, file) => sum + file.size, 0)
      const totalSizeMB = totalSize / (1024 * 1024)

      const formData = await prepareFormData(form, false)
      
      if (totalSizeMB <= 6) {
        uploadProgress.value = 50
      }
      
      const result = await adminProjectsStore.addProject(formData)

      if (result.success) {
        uploadProgress.value = 100
        router.push({ name: 'admin-projects' })
      } else {
        alert(`პროექტის შექმნა ვერ მოხერხდა: ${result.error}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'უცნობი შეცდომა'
      alert(`პროექტის შექმნა ვერ მოხერხდა: ${errorMessage}`)
    } finally {
      submitting.value = false
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    form,
    previews,
    submitting,
    translating,
    uploadProgress,
    isUploading,

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
