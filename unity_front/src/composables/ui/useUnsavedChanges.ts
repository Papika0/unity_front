import { ref, type Ref } from 'vue'
import { onBeforeRouteLeave, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'

export interface UnsavedChangesOptions {
  hasChanges: Ref<boolean>
  isSaving: Ref<boolean>
  onSave?: () => Promise<void>
  onDiscard?: () => void
  message?: string
}

interface PendingNavigation {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  next: NavigationGuardNext
}

export function useUnsavedChanges(options: UnsavedChangesOptions) {
  const showConfirmDialog = ref(false)
  const pendingNavigation = ref<PendingNavigation | null>(null)
  const isNavigating = ref(false)

  // Default messages in Georgian
  const message = options.message || 'გაქვთ შეუნახავი ცვლილებები. გსურთ მათი შენახვა?'

  // Setup Vue Router navigation guard
  onBeforeRouteLeave((to, from, next) => {
    // Allow navigation if no changes or currently saving or already navigating
    if (!options.hasChanges.value || options.isSaving.value || isNavigating.value) {
      next()
      return
    }

    // Show confirmation dialog and store navigation for later
    showConfirmDialog.value = true
    pendingNavigation.value = { to, from, next }

    // Block navigation until user decides
    return false
  })

  // Setup browser beforeunload event (for refresh/close)
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (options.hasChanges.value && !options.isSaving.value) {
      e.preventDefault()
      e.returnValue = 'თქვენ გაქვთ შეუნახავი ცვლილებები. დარწმუნებული ხართ რომ გსურთ გვერდის დატოვება?'
      return e.returnValue
    }
  }

  // Add beforeunload listener
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload)
  }

  // Cleanup
  const cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }

  // Handle save and navigate
  const saveAndNavigate = async () => {
    if (!options.onSave) {
      console.warn('onSave callback not provided')
      return
    }

    try {
      await options.onSave()
      proceedWithNavigation()
    } catch (error) {
      console.error('Save failed:', error)
      // Keep dialog open on error
    }
  }

  // Handle discard and navigate
  const discardAndNavigate = () => {
    if (options.onDiscard) {
      options.onDiscard()
    }
    proceedWithNavigation()
  }

  // Cancel navigation
  const cancelNavigation = () => {
    showConfirmDialog.value = false
    pendingNavigation.value = null
  }

  // Proceed with pending navigation
  const proceedWithNavigation = () => {
    showConfirmDialog.value = false

    if (pendingNavigation.value) {
      isNavigating.value = true
      const { next } = pendingNavigation.value
      pendingNavigation.value = null
      next()
    }
  }

  // Check if navigation can proceed (for manual checks like dropdown changes)
  const canNavigate = () => {
    return !options.hasChanges.value || options.isSaving.value
  }

  // Confirm navigation for dropdown changes
  const confirmNavigationChange = (message?: string): boolean => {
    if (canNavigate()) {
      return true
    }

    const msg = message || 'გაქვთ შეუნახავი ცვლილებები. დარწმუნებული ხართ რომ გსურთ გაგრძელება?'
    return confirm(msg)
  }

  return {
    showConfirmDialog,
    saveAndNavigate,
    discardAndNavigate,
    cancelNavigation,
    canNavigate,
    confirmNavigationChange,
    message,
    cleanup
  }
}
