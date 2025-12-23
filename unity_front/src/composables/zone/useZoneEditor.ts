/**
 * Zone Editor Composable
 * Shared state and utilities for zone editors (ApartmentEditor, FloorStripEditor, BuildingBlockEditor)
 */

import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios/api'
import { useToast } from '@/composables/ui/useToast'
import { useZoneValidation } from '@/composables/zone/useZoneValidation'
import { useUnsavedChanges } from '@/composables/ui/useUnsavedChanges'
import { useAutoSave } from '@/composables/ui/useAutoSave'
import type { Polygon } from '@/utils/polygon'

export interface ZoneResponse {
  id: number
  svg_coordinates: number[][]
  entity_id: number | null
  entity_type: string
  display_config: {
    label?: string
    fill?: string
    stroke?: string
    hover?: string
  }
}

export interface UseZoneEditorOptions {
  zoneType: string
  entityType: string
  levelType?: string
  draftKeyPrefix: string
}

export function useZoneEditor(options: UseZoneEditorOptions) {
  const route = useRoute()
  const { success, error: showError, warning, info } = useToast()
  const { validateZones } = useZoneValidation()

  // ==================== STATE ====================
  const zones = ref<Polygon[]>([])
  const isSaving = ref(false)
  const hasChanges = ref(false)
  const backgroundImageUrl = ref('')
  const imageWidth = ref(1200)
  const imageHeight = ref(800)

  // ==================== ROUTE PARAMS ====================
  const projectId = computed(() => {
    const id = route.params.id
    return (Array.isArray(id) ? id[0] : id) || ''
  })

  const buildingId = computed(() => {
    const id = route.params.buildingId
    return (Array.isArray(id) ? id[0] : id) || ''
  })

  const floorNumber = computed(() => {
    const floor = route.params.floorNumber
    return parseInt((Array.isArray(floor) ? floor[0] : floor) || '0')
  })

  // ==================== DRAFT KEY ====================
  const draftKey = computed(() => {
    const pid = projectId.value || 'new'
    const bid = buildingId.value
    const floor = floorNumber.value
    if (floor !== 0) return `${options.draftKeyPrefix}-${pid}-${bid}-${floor}`
    if (bid) return `${options.draftKeyPrefix}-${pid}-${bid}`
    return `${options.draftKeyPrefix}-${pid}`
  })

  // ==================== AUTO-SAVE ====================
  const { loadDraft, clearDraft, checkForDraft, getLastSavedTime, startAutoSave } = useAutoSave({
    key: draftKey.value,
    data: zones,
    hasChanges,
    interval: 30000,
  })

  // ==================== UNSAVED CHANGES ====================
  const createUnsavedChangesHandler = (saveZones: () => Promise<void>, loadZones: () => Promise<void>) => {
    return useUnsavedChanges({
      hasChanges,
      isSaving,
      onSave: async () => { await saveZones() },
      onDiscard: () => { loadZones(); hasChanges.value = false },
      message: 'გაქვთ შეუნახავი ზონები. გსურთ მათი შენახვა?',
    })
  }

  // ==================== ZONE MANAGEMENT ====================
  const handleZonesChange = (updatedZones: Polygon[]) => {
    zones.value = updatedZones
    hasChanges.value = true
  }

  const handleDiscard = (loadZones: () => Promise<void>) => {
    loadZones()
    hasChanges.value = false
    clearDraft()
    info('ცვლილებები გაუქმდა')
  }

  const mapZonesFromResponse = (data: ZoneResponse[]): Polygon[] => {
    return (data || []).map((zone: ZoneResponse) => ({
      id: `zone-${zone.id}`,
      points: zone.svg_coordinates.map((coord: number[]) => ({ x: coord[0], y: coord[1] })),
      entityId: zone.entity_id,
      label: zone.display_config.label || `Zone ${zone.entity_id}`,
      fillColor: zone.display_config.fill || '#10b98180',
      strokeColor: zone.display_config.stroke || '#10b981',
      visible: true,
      selected: false,
    }))
  }

  // ==================== SAVE ZONES ====================
  const saveZones = async (
    additionalParams: Record<string, unknown> = {}
  ): Promise<boolean> => {
    if (!projectId.value || !hasChanges.value) return false

    const validation = validateZones(zones.value, imageWidth.value, imageHeight.value)
    if (!validation.valid) {
      validation.errors.forEach((err) => showError(err, 5000))
      return false
    }
    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warn) => warning(warn, 4000))
    }

    isSaving.value = true
    try {
      // Delete existing zones
      await api.delete(`/admin/projects/${projectId.value}/interactive-zones`, {
        params: { zone_type: options.zoneType, ...additionalParams },
      })

      // Create new zones
      for (const zone of zones.value) {
        await api.post(`/admin/projects/${projectId.value}/interactive-zones`, {
          zone_type: options.zoneType,
          level_type: options.levelType || 'floor',
          entity_id: zone.entityId,
          entity_type: options.entityType,
          svg_coordinates: zone.points,
          display_config: {
            label: zone.label,
            fill: zone.fillColor,
            stroke: zone.strokeColor,
            hover: zone.fillColor?.replace('80', 'cc'),
          },
          ...additionalParams,
        })
      }

      hasChanges.value = false
      clearDraft()
      success('ზონები წარმატებით შეინახა!')
      return true
    } catch (error) {
      console.error('Failed to save zones:', error)
      showError('ზონების შენახვა ვერ მოხერხდა')
      return false
    } finally {
      isSaving.value = false
    }
  }

  // ==================== RETURN ====================
  return {
    // State
    zones,
    isSaving,
    hasChanges,
    backgroundImageUrl,
    imageWidth,
    imageHeight,
    // Route params
    projectId,
    buildingId,
    floorNumber,
    // Draft
    draftKey,
    loadDraft,
    clearDraft,
    checkForDraft,
    getLastSavedTime,
    startAutoSave,
    // Handlers
    handleZonesChange,
    handleDiscard,
    mapZonesFromResponse,
    saveZones,
    createUnsavedChangesHandler,
    // Validation
    validateZones,
  }
}
