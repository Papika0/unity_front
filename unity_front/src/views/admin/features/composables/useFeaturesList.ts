/**
 * useFeaturesList - Composable for managing features list
 * Handles loading and deleting features
 */

import { ref, onMounted } from 'vue'
import { featuresApi, type Feature } from '@/services/featuresApi'

export function useFeaturesList() {
  // ============================================
  // STATE
  // ============================================
  const features = ref<Feature[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ============================================
  // ACTIONS
  // ============================================
  const loadFeatures = async () => {
    isLoading.value = true
    error.value = null

    try {
      features.value = await featuresApi.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load features'
      console.error('Failed to load features:', err)
    } finally {
      isLoading.value = false
    }
  }

  const deleteFeature = async (id: number) => {
    if (!confirm('დარწმუნებული ხართ, რომ გსურთ ამ ფუნქციის წაშლა?')) return

    try {
      await featuresApi.delete(id)
      await loadFeatures()
    } catch (err) {
      console.error('Failed to delete feature:', err)
      alert('ფუნქციის წაშლა ვერ მოხერხდა')
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadFeatures()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    features,
    isLoading,
    error,

    // Actions
    loadFeatures,
    deleteFeature,
  }
}
