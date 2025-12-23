/**
 * Morphological operations for mask processing
 */

/**
 * Clean up mask using morphological operations (closing + opening)
 */
export function cleanupMask(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number
): Uint8Array {
  // Closing: dilate then erode - fills small gaps/holes within apartments
  let result = dilate(mask, width, height, radius)
  result = erode(result, width, height, radius)

  // Additional closing pass with smaller radius to fill tiny gaps
  result = dilate(result, width, height, Math.max(1, Math.floor(radius / 2)))
  result = erode(result, width, height, Math.max(1, Math.floor(radius / 2)))

  // Opening: erode then dilate - removes small noise outside apartments
  result = erode(result, width, height, Math.max(1, radius - 1))
  result = dilate(result, width, height, Math.max(1, radius - 1))

  return result
}

/**
 * Morphological dilation - expands white regions
 */
export function dilate(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number
): Uint8Array {
  const result = new Uint8Array(mask.length)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x

      // Check if any neighbor within radius is set
      let found = false
      for (let dy = -radius; dy <= radius && !found; dy++) {
        for (let dx = -radius; dx <= radius && !found; dx++) {
          const ny = y + dy
          const nx = x + dx

          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = ny * width + nx
            if (mask[nidx]) {
              found = true
              result[idx] = 1
            }
          }
        }
      }
    }
  }

  return result
}

/**
 * Morphological erosion - shrinks white regions
 */
export function erode(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number
): Uint8Array {
  const result = new Uint8Array(mask.length)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x

      if (!mask[idx]) continue

      // Check if all neighbors within radius are set
      let allSet = true
      for (let dy = -radius; dy <= radius && allSet; dy++) {
        for (let dx = -radius; dx <= radius && allSet; dx++) {
          const ny = y + dy
          const nx = x + dx

          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = ny * width + nx
            if (!mask[nidx]) {
              allSet = false
            }
          } else {
            // Treat out-of-bounds as not set
            allSet = false
          }
        }
      }

      if (allSet) {
        result[idx] = 1
      }
    }
  }

  return result
}
