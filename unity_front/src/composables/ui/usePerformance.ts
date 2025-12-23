import { ref } from 'vue'

export interface PerformanceMetrics {
  [key: string]: number
}

export function usePerformance() {
  const metrics = ref<PerformanceMetrics>({})
  const timers = ref<Record<string, number>>({})

  const startTimer = (label: string) => {
    timers.value[label] = performance.now()
  }

  const endTimer = (label: string) => {
    const start = timers.value[label]
    if (start) {
      const duration = performance.now() - start
      metrics.value[label] = duration

      // Clean up timer
      delete timers.value[label]

      return duration
    }
    return 0
  }

  const getMetric = (label: string): number | undefined => {
    return metrics.value[label]
  }

  const getAllMetrics = (): PerformanceMetrics => {
    return { ...metrics.value }
  }

  const clearMetrics = () => {
    metrics.value = {}
    timers.value = {}
  }

  return {
    metrics: metrics.value,
    startTimer,
    endTimer,
    getMetric,
    getAllMetrics,
    clearMetrics,
  }
}
