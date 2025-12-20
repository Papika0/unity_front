/**
 * Polygon simplification algorithms
 */

import { ramerDouglasPeucker, mergeCollinearPoints, removeClosePoints } from './simplification-utils'

/**
 * Simplify polygon using advanced multi-pass algorithm
 */
export function simplifyPolygon(
  points: number[][],
  tolerance: number,
  cornerAngleThreshold: number
): number[][] {
  if (points.length <= 2) return points

  // First pass: Aggressive RDP simplification
  let simplified = ramerDouglasPeucker(points, tolerance)

  // Second pass: Detect and keep only significant corners (wall intersections)
  simplified = detectCorners(simplified, cornerAngleThreshold)

  // Third pass: Straighten near-horizontal and near-vertical lines (architectural alignment)
  simplified = alignToArchitecturalAngles(simplified, 5)

  // Fourth pass: Merge collinear points
  simplified = mergeCollinearPoints(simplified, tolerance * 0.3)

  // Final pass: Remove points that are too close together
  simplified = removeClosePoints(simplified, Math.max(3, tolerance * 0.2))

  return simplified
}

/**
 * Detect and keep only significant corners (major direction changes)
 */
export function detectCorners(points: number[][], minAngleDegrees: number): number[][] {
  if (points.length <= 3) return points

  const result: number[][] = [points[0]]
  const minAngle = (minAngleDegrees * Math.PI) / 180

  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1]
    const curr = points[i]
    const next = points[i + 1]

    // Calculate vectors
    const v1x = curr[0] - prev[0]
    const v1y = curr[1] - prev[1]
    const v2x = next[0] - curr[0]
    const v2y = next[1] - curr[1]

    // Calculate angle between vectors
    const dot = v1x * v2x + v1y * v2y
    const len1 = Math.sqrt(v1x * v1x + v1y * v1y)
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y)

    if (len1 === 0 || len2 === 0) continue

    const cosAngle = dot / (len1 * len2)
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)))

    // Keep point if it's a significant corner
    if (angle > minAngle) {
      result.push(curr)
    }
  }

  // Always add the last point
  result.push(points[points.length - 1])

  return result
}

/**
 * Align lines to horizontal/vertical (architectural drawings often have these)
 */
export function alignToArchitecturalAngles(points: number[][], angleTolerance: number): number[][] {
  if (points.length <= 2) return points

  const result: number[][] = []
  const tolerance = (angleTolerance * Math.PI) / 180

  for (let i = 0; i < points.length; i++) {
    const curr = points[i]
    const next = points[(i + 1) % points.length]

    const dx = next[0] - curr[0]
    const dy = next[1] - curr[1]
    const angle = Math.atan2(dy, dx)

    // Snap to 0, 90, 180, 270 if close enough
    const snappedAngle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2)

    if (Math.abs(angle - snappedAngle) < tolerance) {
      // Adjust next point to align with snapped angle
      const dist = Math.sqrt(dx * dx + dy * dy)
      const newNext: number[] = [
        curr[0] + dist * Math.cos(snappedAngle),
        curr[1] + dist * Math.sin(snappedAngle),
      ]
      result.push(curr)

      // Store the aligned next point for next iteration
      if (i < points.length - 1) {
        points[i + 1] = newNext
      }
    } else {
      result.push(curr)
    }
  }

  return result.length > 0 ? result : points
}
