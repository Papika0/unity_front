import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<Toast[]>([])
let idCounter = 0

export function useToast() {
  const showToast = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = ++idCounter
    const toast: Toast = { id, message, type, duration }
    
    toasts.value.push(toast)
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  const success = (message: string, duration?: number) => {
    return showToast(message, 'success', duration)
  }
  
  const error = (message: string, duration?: number) => {
    return showToast(message, 'error', duration)
  }
  
  const info = (message: string, duration?: number) => {
    return showToast(message, 'info', duration)
  }
  
  const warning = (message: string, duration?: number) => {
    return showToast(message, 'warning', duration)
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
