import { ref, onUnmounted } from 'vue'

interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export interface PerformanceMetrics {
  initialLoadTime: number
  apiCallTime: number
  renderTime: number
  filterTime: number
  dealCount: number
  visibleDeals: number
  memoryUsage?: number
}

export interface PerformanceMark {
  name: string
  timestamp: number
}

/**
 * Composable for monitoring CRM pipeline performance
 * Dev-mode only - provides timing metrics and optional overlay
 */
export function usePerformanceMonitor() {
  const isDev = import.meta.env.DEV

  const metrics = ref<PerformanceMetrics>({
    initialLoadTime: 0,
    apiCallTime: 0,
    renderTime: 0,
    filterTime: 0,
    dealCount: 0,
    visibleDeals: 0
  })

  const showOverlay = ref(false)
  const marks = new Map<string, number>()

  /**
   * Mark the start of a performance measurement
   */
  function markStart(name: string): void {
    if (!isDev) return

    const markName = `${name}-start`
    marks.set(markName, performance.now())

    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(markName)
    }
  }

  /**
   * Mark the end of a performance measurement and return duration
   */
  function markEnd(name: string): number {
    if (!isDev) return 0

    const startMark = `${name}-start`
    const endMark = `${name}-end`

    const startTime = marks.get(startMark)
    if (!startTime) {
      console.warn(`[Performance] No start mark found for: ${name}`)
      return 0
    }

    const endTime = performance.now()
    marks.set(endMark, endTime)

    const duration = endTime - startTime

    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(endMark)

      try {
        performance.measure(name, startMark, endMark)
      } catch {
        // Marks might not exist, ignore
      }
    }

    return duration
  }

  /**
   * Measure execution time of a function
   */
  async function measure<T>(
    name: string,
    fn: () => T | Promise<T>
  ): Promise<T> {
    if (!isDev) return await fn()

    markStart(name)
    try {
      const result = await fn()
      const duration = markEnd(name)
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      return result
    } catch (error) {
      markEnd(name)
      throw error
    }
  }

  /**
   * Mark API call start
   */
  function markApiStart(): void {
    markStart('api-call')
  }

  /**
   * Mark API call end
   */
  function markApiEnd(): void {
    const duration = markEnd('api-call')
    metrics.value.apiCallTime = duration

    if (isDev) {
      console.log(`[Performance] API Call: ${duration.toFixed(2)}ms`)
    }
  }

  /**
   * Mark render start
   */
  function markRenderStart(): void {
    markStart('render')
  }

  /**
   * Mark render end
   */
  function markRenderEnd(): void {
    const duration = markEnd('render')
    metrics.value.renderTime = duration

    if (isDev) {
      console.log(`[Performance] Render: ${duration.toFixed(2)}ms`)

      // Warn if render is slow
      if (duration > 100) {
        console.warn(`⚠️ [Performance] Slow render detected: ${duration.toFixed(2)}ms (threshold: 100ms)`)
      }
    }
  }

  /**
   * Measure filter performance
   */
  function measureFilter(fn: () => void): void {
    if (!isDev) {
      fn()
      return
    }

    const start = performance.now()
    fn()
    const duration = performance.now() - start

    metrics.value.filterTime = duration

    if (duration > 50) {
      console.warn(`⚠️ [Performance] Slow filter: ${duration.toFixed(2)}ms`)
    }
  }

  /**
   * Update deal count metrics
   */
  function updateDealCounts(total: number, visible: number): void {
    metrics.value.dealCount = total
    metrics.value.visibleDeals = visible
  }

  /**
   * Calculate total initial load time
   */
  function calculateInitialLoad(): void {
    metrics.value.initialLoadTime = metrics.value.apiCallTime + metrics.value.renderTime

    if (isDev) {
      console.log(`
╔════════════════════════════════════════════════════╗
║          CRM PIPELINE PERFORMANCE REPORT           ║
╠════════════════════════════════════════════════════╣
║ API Call Time:    ${metrics.value.apiCallTime.toFixed(2).padStart(10)} ms     ║
║ Render Time:      ${metrics.value.renderTime.toFixed(2).padStart(10)} ms     ║
║ Total Load Time:  ${metrics.value.initialLoadTime.toFixed(2).padStart(10)} ms     ║
╠════════════════════════════════════════════════════╣
║ Total Deals:      ${String(metrics.value.dealCount).padStart(10)}          ║
║ Visible Deals:    ${String(metrics.value.visibleDeals).padStart(10)}          ║
╚════════════════════════════════════════════════════╝
      `)

      // Performance assessment
      if (metrics.value.initialLoadTime < 1000) {
        console.log('✅ Excellent performance!')
      } else if (metrics.value.initialLoadTime < 2000) {
        console.log('✔️ Good performance')
      } else if (metrics.value.initialLoadTime < 3000) {
        console.log('⚠️ Acceptable performance')
      } else {
        console.warn('❌ Poor performance - optimization recommended')
      }
    }
  }

  /**
   * Log performance metrics to console
   */
  function logMetrics(): void {
    if (!isDev) return

    console.table({
      'API Call': `${metrics.value.apiCallTime.toFixed(2)}ms`,
      'Render': `${metrics.value.renderTime.toFixed(2)}ms`,
      'Initial Load': `${metrics.value.initialLoadTime.toFixed(2)}ms`,
      'Filter': `${metrics.value.filterTime.toFixed(2)}ms`,
      'Total Deals': metrics.value.dealCount,
      'Visible Deals': metrics.value.visibleDeals
    })
  }

  /**
   * Get memory usage (if available)
   */
  function getMemoryUsage(): number | undefined {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as Performance & { memory: PerformanceMemory }).memory
      // Convert bytes to MB
      return Math.round(memory.usedJSHeapSize / 1024 / 1024)
    }
    return undefined
  }

  /**
   * Toggle metrics overlay
   */
  function toggleOverlay(): void {
    showOverlay.value = !showOverlay.value

    if (showOverlay.value) {
      // Update memory usage when showing overlay
      metrics.value.memoryUsage = getMemoryUsage()
    }
  }

  /**
   * Keyboard shortcut handler for overlay
   */
  function handleKeyPress(event: KeyboardEvent): void {
    // Ctrl+Shift+P or Cmd+Shift+P
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
      event.preventDefault()
      toggleOverlay()
    }
  }

  /**
   * Start listening for keyboard shortcuts
   */
  function startKeyboardListener(): void {
    if (!isDev) return
    window.addEventListener('keydown', handleKeyPress)
  }

  /**
   * Stop listening for keyboard shortcuts
   */
  function stopKeyboardListener(): void {
    if (!isDev) return
    window.removeEventListener('keydown', handleKeyPress)
  }

  /**
   * Clear all performance marks
   */
  function clearMarks(): void {
    marks.clear()

    if (typeof performance !== 'undefined') {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }

  /**
   * Get current metrics snapshot
   */
  function getMetrics(): PerformanceMetrics {
    return { ...metrics.value }
  }

  // Start keyboard listener when composable is used
  if (isDev) {
    startKeyboardListener()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopKeyboardListener()
    clearMarks()
  })

  return {
    // State
    metrics,
    showOverlay,

    // Timing methods
    markStart,
    markEnd,
    measure,

    // Specific marks
    markApiStart,
    markApiEnd,
    markRenderStart,
    markRenderEnd,

    // Measurements
    measureFilter,
    updateDealCounts,
    calculateInitialLoad,

    // Utilities
    logMetrics,
    getMetrics,
    getMemoryUsage,
    toggleOverlay,
    clearMarks
  }
}
