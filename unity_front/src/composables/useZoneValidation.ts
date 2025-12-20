/**
 * Zone Validation Composable
 * Validates polygon zones for completeness and correctness
 */

import { 
  calculatePolygonArea, 
  calculateBoundingBox, 
  boundingBoxesOverlap,
  type Point 
} from '@/utils/polygonGeometry'

interface Polygon {
  id: string
  points: Point[]
  entityId?: number | null
  label: string
  fillColor?: string
  strokeColor?: string
  visible: boolean
  selected?: boolean
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

interface OverlapInfo {
  zone1: string
  zone2: string
}

export function useZoneValidation() {
  // ==================== OVERLAP DETECTION ====================
  const polygonsOverlap = (poly1: Polygon, poly2: Polygon): boolean => {
    const box1 = calculateBoundingBox(poly1.points)
    const box2 = calculateBoundingBox(poly2.points)
    return boundingBoxesOverlap(box1, box2)
  }

  const detectOverlaps = (zones: Polygon[]): OverlapInfo[] => {
    const overlaps: OverlapInfo[] = []
    for (let i = 0; i < zones.length; i++) {
      for (let j = i + 1; j < zones.length; j++) {
        if (polygonsOverlap(zones[i], zones[j])) {
          overlaps.push({
            zone1: zones[i].label || `ზონა ${i + 1}`,
            zone2: zones[j].label || `ზონა ${j + 1}`
          })
        }
      }
    }
    return overlaps
  }

  // ==================== MAIN VALIDATION ====================
  const validateZones = (zones: Polygon[], imageWidth: number, imageHeight: number): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for unassigned zones
    const unassigned = zones.filter(z => z.entityId === null || z.entityId === undefined)
    if (unassigned.length > 0) {
      errors.push(`${unassigned.length} ზონას არ აქვს მინიჭებული ელემენტი. გთხოვთ მიუთითოთ ყველა ზონისთვის.`)
    }

    // Check for duplicate entity assignments
    const entityIds = zones.map(z => z.entityId).filter((id): id is number => id !== null && id !== undefined)
    const duplicateIds = entityIds.filter((id, index) => entityIds.indexOf(id) !== index)
    const uniqueDuplicates = [...new Set(duplicateIds)]
    if (uniqueDuplicates.length > 0) {
      errors.push(`აღმოჩენილია დუბლირებული ელემენტები: ${uniqueDuplicates.join(', ')}. ერთ ელემენტს არ შეიძლება რამდენიმე ზონა ჰქონდეს.`)
    }

    // Check for zones outside image bounds
    if (imageWidth > 0 && imageHeight > 0) {
      const outOfBounds = zones.filter(z => z.points.some(p => p.x < 0 || p.x > imageWidth || p.y < 0 || p.y > imageHeight))
      if (outOfBounds.length > 0) {
        warnings.push(`${outOfBounds.length} ზონა სურათის ფარგლებს გარეთ არის. შეამოწმეთ კოორდინატები.`)
      }
    }

    // Check for overlapping zones
    const overlaps = detectOverlaps(zones)
    if (overlaps.length > 0) {
      const overlapMessages = overlaps.slice(0, 3).map(o => `"${o.zone1}" და "${o.zone2}"`)
      const moreText = overlaps.length > 3 ? ` და კიდევ ${overlaps.length - 3}...` : ''
      warnings.push(`აღმოჩენილია ${overlaps.length} გადაფარვა ზონებს შორის: ${overlapMessages.join(', ')}${moreText}. დარწმუნდით რომ ზონები არ ფარავენ ერთმანეთს.`)
    }

    // Check for very small zones
    const tooSmall = zones.filter(z => {
      const area = calculatePolygonArea(z.points)
      return area < 100 && area > 0
    })
    if (tooSmall.length > 0) {
      warnings.push(`${tooSmall.length} ზონა ძალიან პატარაა (< 100px²). დარწმუნდით რომ ზონები სწორად არის დახატული.`)
    }

    // Check for invalid polygons
    const invalidPolygons = zones.filter(z => z.points.length < 3)
    if (invalidPolygons.length > 0) {
      errors.push(`${invalidPolygons.length} ზონას აქვს არასაკმარისი წერტილები (< 3). პოლიგონს სჭირდება მინიმუმ 3 წერტილი.`)
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  // ==================== RETURN ====================
  return {
    validateZones,
    detectOverlaps,
    calculatePolygonArea,
    calculateBoundingBox,
    polygonsOverlap
  }
}
