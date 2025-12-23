import { ref } from 'vue'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  action?: ToastAction
  dismissible?: boolean
}

const toasts = ref<Toast[]>([])
let idCounter = 0

export function useToast() {
  const showToast = (
    message: string,
    type: Toast['type'] = 'info',
    duration?: number,
    action?: ToastAction,
    dismissible = true
  ) => {
    const id = ++idCounter

    // Default durations based on type
    const defaultDuration = duration !== undefined ? duration : (
      type === 'error' ? 5000 :
      type === 'warning' ? 4000 :
      3000
    )

    const toast: Toast = {
      id,
      message,
      type,
      duration: defaultDuration,
      action,
      dismissible
    }

    toasts.value.push(toast)

    if (defaultDuration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, defaultDuration)
    }

    return id
  }
  
  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const success = (message: string, duration?: number, action?: ToastAction) => {
    return showToast(message, 'success', duration, action)
  }

  const error = (message: string, duration?: number, action?: ToastAction) => {
    return showToast(message, 'error', duration, action)
  }

  const info = (message: string, duration?: number, action?: ToastAction) => {
    return showToast(message, 'info', duration, action)
  }

  const warning = (message: string, duration?: number, action?: ToastAction) => {
    return showToast(message, 'warning', duration, action)
  }
  
  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}
