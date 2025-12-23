/**
 * Contour tracing and region detection functions
 */

/**
 * Find ALL connected regions in a mask (not just the largest one)
 * This treats each separate colored area as a distinct apartment
 */
export function findAllConnectedRegions(
  mask: Uint8Array,
  width: number,
  height: number,
  minArea: number
): Array<number[]> {
  const visited = new Uint8Array(width * height)
  const regions: Array<number[]> = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x

      if (!mask[idx] || visited[idx]) continue

      // Found a new region - flood fill it
      const pixels: number[] = []
      const stack: number[] = [idx]

      while (stack.length > 0) {
        const current = stack.pop()!
        if (visited[current]) continue

        const cy = Math.floor(current / width)
        const cx = current % width

        if (!mask[current]) continue

        visited[current] = 1
        pixels.push(current)

        // Add 4-connected neighbors
        if (cx > 0) stack.push(current - 1)
        if (cx < width - 1) stack.push(current + 1)
        if (cy > 0) stack.push(current - width)
        if (cy < height - 1) stack.push(current + width)
      }

      // Keep this region if it's large enough
      if (pixels.length >= minArea) {
        regions.push(pixels)
      }
    }
  }

  return regions
}

/**
 * Trace the outer contour of a binary mask using Moore-neighbor tracing
 */
export function traceOuterContour(
  mask: Uint8Array,
  width: number,
  height: number
): number[][] | null {
  // Find the first boundary pixel (top-left-most)
  let startX = -1
  let startY = -1

  outerLoop: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x

      if (!mask[idx]) continue

      // Check if this is a boundary pixel
      const isBoundary =
        x === 0 ||
        x === width - 1 ||
        y === 0 ||
        y === height - 1 ||
        !mask[idx - 1] ||
        !mask[idx + 1] ||
        !mask[idx - width] ||
        !mask[idx + width]

      if (isBoundary) {
        startX = x
        startY = y
        break outerLoop
      }
    }
  }

  if (startX === -1) return null

  // Moore neighborhood (8-connected)
  const directions = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ]

  const contour: number[][] = []
  let x = startX
  let y = startY
  let dir = 7 // Start looking from top-left

  const maxIterations = width * height
  let iterations = 0

  do {
    contour.push([x, y])

    // Look for next boundary pixel
    let found = false

    for (let i = 0; i < 8; i++) {
      const checkDir = (dir + i) % 8
      const [dx, dy] = directions[checkDir]
      const nx = x + dx
      const ny = y + dy

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

      const nidx = ny * width + nx

      if (mask[nidx]) {
        // Check if it's a boundary pixel
        const isBoundary =
          nx === 0 ||
          nx === width - 1 ||
          ny === 0 ||
          ny === height - 1 ||
          !mask[nidx - 1] ||
          !mask[nidx + 1] ||
          !mask[nidx - width] ||
          !mask[nidx + width]

        if (isBoundary) {
          x = nx
          y = ny
          dir = (checkDir + 5) % 8 // Turn counter-clockwise for next search
          found = true
          break
        }
      }
    }

    if (!found) break

    iterations++
  } while ((x !== startX || y !== startY) && iterations < maxIterations)

  return contour.length >= 4 ? contour : null
}
