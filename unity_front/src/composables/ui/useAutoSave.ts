import { ref, toRaw, watch, onUnmounted, type Ref } from 'vue'

export interface AutoSaveOptions<T> {
  key: string
  data: Ref<T>
  hasChanges: Ref<boolean>
  interval?: number
  enabled?: Ref<boolean>
}

interface DraftData<T> {
  data: T
  timestamp: string
  version: string
}

const DRAFT_VERSION = '1.0'
const DRAFT_EXPIRY_DAYS = 7

export function useAutoSave<T>(options: AutoSaveOptions<T>) {
  const lastSaved = ref<Date | null>(null)
  const hasDraft = ref(false)
  let autoSaveInterval: ReturnType<typeof setInterval> | null = null

  // Save draft to localStorage
  const saveDraft = () => {
    try {
      const draft: DraftData<T> = {
        data: toRaw(options.data.value),
        timestamp: new Date().toISOString(),
        version: DRAFT_VERSION
      }
      localStorage.setItem(options.key, JSON.stringify(draft))
      lastSaved.value = new Date()
      hasDraft.value = true
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  // Load draft from localStorage
  const loadDraft = (): T | null => {
    try {
      const stored = localStorage.getItem(options.key)
      if (!stored) return null

      const draft: DraftData<T> = JSON.parse(stored)

      // Check if draft is expired
      const draftDate = new Date(draft.timestamp)
      const now = new Date()
      const daysDiff = (now.getTime() - draftDate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysDiff > DRAFT_EXPIRY_DAYS) {
        clearDraft()
        return null
      }

      // Check version compatibility
      if (draft.version !== DRAFT_VERSION) {
        console.warn('Draft version mismatch, clearing draft')
        clearDraft()
        return null
      }

      return draft.data
    } catch (error) {
      console.error('Failed to load draft:', error)
      return null
    }
  }

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(options.key)
      hasDraft.value = false
      lastSaved.value = null
    } catch (error) {
      console.error('Failed to clear draft:', error)
    }
  }

  // Check if draft exists
  const checkForDraft = (): boolean => {
    const draft = loadDraft()
    hasDraft.value = draft !== null
    return hasDraft.value
  }

  // Get time since last save in human-readable format (Georgian)
  const getLastSavedTime = (): string | null => {
    if (!lastSaved.value) return null

    const now = new Date()
    const diff = Math.floor((now.getTime() - lastSaved.value.getTime()) / 1000)

    if (diff < 60) return `${diff} წამის წინ`
    if (diff < 3600) return `${Math.floor(diff / 60)} წუთის წინ`
    if (diff < 86400) return `${Math.floor(diff / 3600)} საათის წინ`
    return `${Math.floor(diff / 86400)} დღის წინ`
  }

  // Start auto-save interval
  const startAutoSave = () => {
    const interval = options.interval || 30000 // Default 30 seconds

    autoSaveInterval = setInterval(() => {
      const isEnabled = options.enabled?.value !== false
      if (options.hasChanges.value && isEnabled) {
        saveDraft()
      }
    }, interval)
  }

  // Stop auto-save interval
  const stopAutoSave = () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
  }

  // Watch for data changes to update last saved time
  watch(() => options.data.value, () => {
    if (lastSaved.value) {
      // Reset last saved time when data changes after a save
      const now = new Date()
      const diff = now.getTime() - lastSaved.value.getTime()
      if (diff > (options.interval || 30000)) {
        lastSaved.value = null
      }
    }
  }, { deep: true })

  // Cleanup on unmount
  onUnmounted(() => {
    stopAutoSave()
  })

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    checkForDraft,
    hasDraft,
    lastSaved,
    getLastSavedTime,
    startAutoSave,
    stopAutoSave
  }
}
