interface Point {
  x: number
  y: number
}

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

interface BoundingBox {
  min_x: number
  max_x: number
  min_y: number
  max_y: number
}

interface OverlapInfo {
  zone1: string
  zone2: string
}

export function useZoneValidation() {
  /**
   * Calculate polygon area using Shoelace formula
   */
  const calculatePolygonArea = (points: Point[]): number => {
    if (points.length < 3) return 0

    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    return Math.abs(area / 2)
  }

  /**
   * Calculate bounding box for a polygon
   */
  const calculateBoundingBox = (points: Point[]): BoundingBox => {
    if (points.length === 0) {
      return { min_x: 0, max_x: 0, min_y: 0, max_y: 0 }
    }

    const box: BoundingBox = {
      min_x: points[0].x,
      max_x: points[0].x,
      min_y: points[0].y,
      max_y: points[0].y
    }

    for (const point of points) {
      box.min_x = Math.min(box.min_x, point.x)
      box.max_x = Math.max(box.max_x, point.x)
      box.min_y = Math.min(box.min_y, point.y)
      box.max_y = Math.max(box.max_y, point.y)
    }

    return box
  }

  /**
   * Check if two bounding boxes overlap
   */
  const boundingBoxesOverlap = (box1: BoundingBox, box2: BoundingBox): boolean => {
    return !(
      box1.max_x < box2.min_x ||
      box1.min_x > box2.max_x ||
      box1.max_y < box2.min_y ||
      box1.min_y > box2.max_y
    )
  }

  /**
   * Check if two polygons overlap (simple bounding box check)
   */
  const polygonsOverlap = (poly1: Polygon, poly2: Polygon): boolean => {
    const box1 = calculateBoundingBox(poly1.points)
    const box2 = calculateBoundingBox(poly2.points)
    return boundingBoxesOverlap(box1, box2)
  }

  /**
   * Detect all overlapping zones
   */
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

  /**
   * Main validation function for zones
   */
  const validateZones = (
    zones: Polygon[],
    imageWidth: number,
    imageHeight: number
  ): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // 1. Check for zones without entity assignment
    const unassigned = zones.filter(z => z.entityId === null || z.entityId === undefined)
    if (unassigned.length > 0) {
      errors.push(
        `${unassigned.length} ზონას არ აქვს მინიჭებული ელემენტი. ` +
        `გთხოვთ მიუთითოთ ყველა ზონისთვის.`
      )
    }

    // 2. Check for duplicate entity assignments
    const entityIds = zones
      .map(z => z.entityId)
      .filter((id): id is number => id !== null && id !== undefined)

    const duplicateIds = entityIds.filter((id, index) => entityIds.indexOf(id) !== index)
    const uniqueDuplicates = [...new Set(duplicateIds)]

    if (uniqueDuplicates.length > 0) {
      errors.push(
        `აღმოჩენილია დუბლირებული ელემენტები: ${uniqueDuplicates.join(', ')}. ` +
        `ერთ ელემენტს არ შეიძლება რამდენიმე ზონა ჰქონდეს.`
      )
    }

    // 3. Check for zones outside image bounds
    if (imageWidth > 0 && imageHeight > 0) {
      const outOfBounds = zones.filter(z => {
        return z.points.some(p =>
          p.x < 0 || p.x > imageWidth || p.y < 0 || p.y > imageHeight
        )
      })

      if (outOfBounds.length > 0) {
        warnings.push(
          `${outOfBounds.length} ზონა სურათის ფარგლებს გარეთ არის. ` +
          `შეამოწმეთ კოორდინატები.`
        )
      }
    }

    // 4. Check for overlapping zones
    const overlaps = detectOverlaps(zones)
    if (overlaps.length > 0) {
      const overlapMessages = overlaps.slice(0, 3).map(o => `"${o.zone1}" და "${o.zone2}"`)
      const overlapText = overlapMessages.join(', ')
      const moreText = overlaps.length > 3 ? ` და კიდევ ${overlaps.length - 3}...` : ''

      warnings.push(
        `აღმოჩენილია ${overlaps.length} გადაფარვა ზონებს შორის: ${overlapText}${moreText}. ` +
        `დარწმუნდით რომ ზონები არ ფარავენ ერთმანეთს.`
      )
    }

    // 5. Check for very small zones (likely errors)
    const tooSmall = zones.filter(z => {
      const area = calculatePolygonArea(z.points)
      return area < 100 && area > 0
    })

    if (tooSmall.length > 0) {
      warnings.push(
        `${tooSmall.length} ზონა ძალიან პატარაა (< 100px²). ` +
        `დარწმუნდით რომ ზონები სწორად არის დახატული.`
      )
    }

    // 6. Check for zones with too few points
    const invalidPolygons = zones.filter(z => z.points.length < 3)
    if (invalidPolygons.length > 0) {
      errors.push(
        `${invalidPolygons.length} ზონას აქვს არასაკმარისი წერტილები (< 3). ` +
        `პოლიგონს სჭირდება მინიმუმ 3 წერტილი.`
      )
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  return {
    validateZones,
    detectOverlaps,
    calculatePolygonArea,
    calculateBoundingBox,
    polygonsOverlap
  }
}
