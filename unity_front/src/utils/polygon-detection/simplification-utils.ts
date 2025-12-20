/**
 * Polygon simplification utility algorithms
 */

import { perpendicularDistance } from './calculations'

/**
 * Remove points that are very close to each other
 */
export function removeClosePoints(points: number[][], minDistance: number): number[][] {
  if (points.length <= 3) return points

  const result: number[][] = [points[0]]

  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1]
    const curr = points[i]

    const dx = curr[0] - prev[0]
    const dy = curr[1] - prev[1]
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Only add point if it's far enough from previous
    if (dist >= minDistance) {
      result.push(curr)
    }
  }

  // Ensure we have at least 3 points
  if (result.length < 3 && points.length >= 3) {
    return points
  }

  return result
}

/**
 * Ramer-Douglas-Peucker algorithm for polygon simplification
 */
export function ramerDouglasPeucker(points: number[][], tolerance: number): number[][] {
  if (points.length <= 2) return points

  // Find the point with maximum distance from line segment
  let maxDist = 0
  let maxIndex = 0

  const first = points[0]
  const last = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last)
    if (dist > maxDist) {
      maxDist = dist
      maxIndex = i
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDist > tolerance) {
    const left = ramerDouglasPeucker(points.slice(0, maxIndex + 1), tolerance)
    const right = ramerDouglasPeucker(points.slice(maxIndex), tolerance)

    return [...left.slice(0, -1), ...right]
  } else {
    return [first, last]
  }
}

/**
 * Merge collinear or nearly collinear points
 */
export function mergeCollinearPoints(points: number[][], tolerance: number): number[][] {
  if (points.length <= 3) return points

  const result: number[][] = [points[0]]

  for (let i = 1; i < points.length - 1; i++) {
    const p1 = result[result.length - 1]
    const p2 = points[i]
    const p3 = points[i + 1]

    // Calculate perpendicular distance of p2 from line p1-p3
    const dist = perpendicularDistance(p2, p1, p3)

    // If point is far from the line, keep it (it's a corner)
    if (dist > tolerance) {
      result.push(p2)
    }
  }

  // Always add the last point
  result.push(points[points.length - 1])

  return result
}
