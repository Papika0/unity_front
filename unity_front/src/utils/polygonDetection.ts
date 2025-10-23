/**
 * Automatic polygon detection for floor plan apartments
 * Uses color segmentation and contour detection to identify apartment boundaries
 */

export interface DetectedPolygon {
  points: number[][]
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  area: number
  centroid: { x: number; y: number }
  color?: string
}

export interface DetectionOptions {
  minArea?: number // Minimum area for valid apartment (default: adaptive based on image size)
  maxArea?: number // Maximum area for valid apartment (default: image size / 2)
  colorTolerance?: number // Color matching tolerance (0-255, default: 40)
  simplifyTolerance?: number // Polygon simplification (default: 8.0 for very clean edges)
  edgeThreshold?: number // Edge detection threshold (default: 50)
  morphRadius?: number // Morphological operation radius (default: 5 for filling details)
  cornerAngleThreshold?: number // Min angle for corner detection in degrees (default: 15)
  debug?: boolean // Enable debug visualization (default: false)
  onProgress?: (stage: string, progress: number) => void // Progress callback
}

export interface DebugVisualization {
  originalImage: HTMLCanvasElement
  colorClusters: HTMLCanvasElement
  masks: Array<{ color: string; canvas: HTMLCanvasElement }>
  cleanedMasks: Array<{ color: string; canvas: HTMLCanvasElement }>
  contours: HTMLCanvasElement
}

/**
 * Detect apartment polygons from a floor plan image
 */
export async function detectApartmentPolygons(
  imageFile: File,
  options: DetectionOptions = {}
): Promise<DetectedPolygon[]> {
  // Load image first to calculate adaptive defaults
  const img = await loadImage(imageFile)
  const totalPixels = img.width * img.height
  
  // Calculate adaptive minArea: at least 0.5% of image, but no less than 500
  const adaptiveMinArea = Math.max(500, Math.floor(totalPixels / 200))
  
  const {
    minArea = adaptiveMinArea,
    maxArea = Infinity,
    colorTolerance = 40,
    simplifyTolerance = 8.0,
    morphRadius = 5,
    cornerAngleThreshold = 15,
    debug = false,
    onProgress,
  } = options

  onProgress?.('Loading image', 0)

  // Create canvas for processing
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  console.log(`Processing image: ${img.width}x${img.height} (${totalPixels.toLocaleString()} pixels)`)
  console.log(`Using minArea: ${minArea} (${((minArea / totalPixels) * 100).toFixed(2)}% of image)`)

  // Debug visualization setup
  const debugViz: DebugVisualization | null = debug
    ? {
        originalImage: canvas,
        colorClusters: createCanvas(canvas.width, canvas.height),
        masks: [],
        cleanedMasks: [],
        contours: createCanvas(canvas.width, canvas.height),
      }
    : null

  // Step 1: Find unique apartment colors using clustering
  onProgress?.('Finding apartment colors', 10)
  const apartmentColors = findApartmentColors(imageData)
  console.log(`Found ${apartmentColors.length} distinct apartment colors`)
  
  // Step 1.5: Get the TWO most dominant apartment colors (human-like reasoning)
  const dominantColors = getTwoDominantColors(apartmentColors, 2, colorTolerance)
  console.log(`Using ${dominantColors.length} dominant colors for apartment detection`)

  // Visualize color clusters
  if (debugViz) {
    visualizeColorClusters(imageData, dominantColors, colorTolerance, debugViz.colorClusters)
  }

  // Step 2: For EACH dominant color, find ALL separate regions (not just largest)
  const polygons: DetectedPolygon[] = []
  let processedColors = 0

  for (let i = 0; i < dominantColors.length; i++) {
    const color = dominantColors[i]
    onProgress?.('Processing apartments', 10 + (i / dominantColors.length) * 80)

    // Create binary mask for this color
    const mask = createColorMask(imageData, color, colorTolerance)

    // Debug: visualize original mask
    if (debugViz) {
      const maskCanvas = createCanvas(canvas.width, canvas.height)
      visualizeMask(mask, canvas.width, canvas.height, maskCanvas)
      debugViz.masks.push({ color: color.color, canvas: maskCanvas })
    }

    // Apply morphological operations to clean up the mask and merge fragments
    const cleanedMask = cleanupMask(mask, imageData.width, imageData.height, morphRadius)

    // Debug: visualize cleaned mask
    if (debugViz) {
      const cleanedCanvas = createCanvas(canvas.width, canvas.height)
      visualizeMask(cleanedMask, canvas.width, canvas.height, cleanedCanvas)
      debugViz.cleanedMasks.push({ color: color.color, canvas: cleanedCanvas })
    }

    // Find ALL connected regions for this color (not just the largest one)
    const regions = findAllConnectedRegions(cleanedMask, imageData.width, imageData.height, minArea)
    console.log(`Found ${regions.length} separate regions for color ${color.color}`)

    // Process each region as a separate apartment
    for (const region of regions) {
      // Create mask for this specific region
      const regionMask = new Uint8Array(imageData.width * imageData.height)
      for (const pixelIdx of region) {
        regionMask[pixelIdx] = 1
      }

      // Find the outer contour of this region
      const contour = traceOuterContour(regionMask, imageData.width, imageData.height)

      if (!contour || contour.length < 4) {
        console.log(`Skipped region of color ${color.color} - no valid contour found`)
        continue
      }

      // Calculate area
      const area = calculateArea(contour)
      if (area < minArea || area > maxArea) {
        console.log(
          `Skipped region of color ${color.color} - area ${Math.round(area)} outside range ${minArea}-${maxArea}`
        )
        continue
      }

      // Simplify polygon
      const simplified = simplifyPolygon(contour, simplifyTolerance, cornerAngleThreshold)

      if (simplified.length < 3) {
        console.log(`Skipped region of color ${color.color} - simplified to less than 3 points`)
        continue
      }

      // Calculate properties
      const boundingBox = calculateBoundingBox(simplified)
      const centroid = calculateCentroid(simplified)

      polygons.push({
        points: simplified,
        boundingBox,
        area,
        centroid,
        color: color.color,
      })
    }

    processedColors++
  }

  // Visualize final contours
  if (debugViz) {
    visualizeContours(debugViz.originalImage, polygons, debugViz.contours)
  }

  console.log(`Processed ${processedColors} colors, found ${polygons.length} valid apartment polygons`)

  onProgress?.('Sorting results', 95)

  // Sort by position (top to bottom, left to right)
  polygons.sort((a, b) => {
    const yDiff = a.centroid.y - b.centroid.y
    if (Math.abs(yDiff) > 50) return yDiff
    return a.centroid.x - b.centroid.x
  })

  onProgress?.('Complete', 100)

  // Expose debug visualization for external use
  if (debug && debugViz) {
    ;(polygons as unknown as { __debug?: DebugVisualization }).__debug = debugViz
  }

  return polygons
}

/**
 * Load image from file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Get the N most dominant colors (human-like visual reasoning)
 * Filters out colors that are too similar to already selected ones
 */
function getTwoDominantColors(
  colors: Array<{ r: number; g: number; b: number; color: string }>,
  count: number,
  tolerance: number
): Array<{ r: number; g: number; b: number; color: string }> {
  const result: Array<{ r: number; g: number; b: number; color: string }> = []
  
  for (const color of colors) {
    // Check if this color is too similar to any already selected color
    const tooSimilar = result.some(selectedColor => {
      const dist = Math.sqrt(
        (color.r - selectedColor.r) ** 2 +
        (color.g - selectedColor.g) ** 2 +
        (color.b - selectedColor.b) ** 2
      )
      return dist < tolerance
    })
    
    if (!tooSimilar) {
      result.push(color)
      if (result.length >= count) break
    }
  }
  
  return result
}

/**
 * Find ALL connected regions in a mask (not just the largest one)
 * This treats each separate colored area as a distinct apartment
 */
function findAllConnectedRegions(
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
 * Find distinct apartment colors using clustering algorithm
 */
function findApartmentColors(
  imageData: ImageData
): Array<{ color: string; r: number; g: number; b: number }> {
  const { data } = imageData
  
  // Collect color samples (skip white, black, and gray pixels)
  const colorSamples: Array<{ r: number; g: number; b: number }> = []
  const samplingRate = 10 // Sample every 10th pixel for speed
  
  for (let i = 0; i < data.length; i += 4 * samplingRate) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Skip transparent pixels
    if (a < 128) continue
    
    // Skip white/black/gray pixels (walls, lines, etc.)
    const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15
    if (isGray && (r > 200 || r < 50)) continue
    
    colorSamples.push({ r, g, b })
  }
  
  console.log(`Collected ${colorSamples.length} color samples`)
  
  // Use simple clustering to find dominant colors
  const colorClusters: Array<{
    color: { r: number; g: number; b: number }
    count: number
  }> = []
  
  for (const sample of colorSamples) {
    let foundCluster = false
    
    for (const cluster of colorClusters) {
      const dist = Math.sqrt(
        (sample.r - cluster.color.r) ** 2 +
        (sample.g - cluster.color.g) ** 2 +
        (sample.b - cluster.color.b) ** 2
      )
      
      // Adaptive clustering distance based on total colors found
      // If we have many colors, be more strict to avoid merging distinct apartments
      const clusterDistance = colorClusters.length > 20 ? 25 : 30
      
      if (dist < clusterDistance) {
        // Colors within distance are considered same cluster
        cluster.count++
        // Update cluster center (running average)
        cluster.color.r = Math.round(
          (cluster.color.r * (cluster.count - 1) + sample.r) / cluster.count
        )
        cluster.color.g = Math.round(
          (cluster.color.g * (cluster.count - 1) + sample.g) / cluster.count
        )
        cluster.color.b = Math.round(
          (cluster.color.b * (cluster.count - 1) + sample.b) / cluster.count
        )
        foundCluster = true
        break
      }
    }
    
    if (!foundCluster) {
      colorClusters.push({
        color: { ...sample },
        count: 1,
      })
    }
  }
  
  // Filter clusters by significance
  // Use a lower threshold (0.3%) to catch smaller apartments in large floor plans
  const minClusterSize = Math.max(colorSamples.length * 0.003, 10)
  const significantClusters = colorClusters
    .filter((c) => c.count > minClusterSize)
    .sort((a, b) => b.count - a.count)
    .slice(0, 30) // Increased from 20 to handle complex floor plans
  
  console.log(`Found ${significantClusters.length} significant color clusters`)
  
  return significantClusters.map((c) => ({
    r: c.color.r,
    g: c.color.g,
    b: c.color.b,
    color: `rgb(${c.color.r},${c.color.g},${c.color.b})`,
  }))
}

/**
 * Create a binary mask for pixels matching the target color
 */
function createColorMask(
  imageData: ImageData,
  targetColor: { r: number; g: number; b: number },
  tolerance: number
): Uint8Array {
  const { data, width, height } = imageData
  const mask = new Uint8Array(width * height)
  
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    if (a < 128) continue
    
    // Calculate color distance
    const dist = Math.sqrt(
      (r - targetColor.r) ** 2 +
      (g - targetColor.g) ** 2 +
      (b - targetColor.b) ** 2
    )
    
    if (dist <= tolerance) {
      mask[j] = 1
    }
  }
  
  return mask
}

/**
 * Clean up mask using morphological operations (closing + opening)
 */
function cleanupMask(
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
function dilate(
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
function erode(
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

/**
 * Trace the outer contour of a binary mask using Moore-neighbor tracing
 */
function traceOuterContour(
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

/**
 * Simplify polygon using advanced multi-pass algorithm
 */
function simplifyPolygon(points: number[][], tolerance: number, cornerAngleThreshold: number): number[][] {
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
function detectCorners(points: number[][], minAngleDegrees: number): number[][] {
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
function alignToArchitecturalAngles(points: number[][], angleTolerance: number): number[][] {
  if (points.length <= 2) return points
  
  const result: number[][] = []
  const tolerance = (angleTolerance * Math.PI) / 180
  
  for (let i = 0; i < points.length; i++) {
    const curr = points[i]
    const next = points[(i + 1) % points.length]
    
    const dx = next[0] - curr[0]
    const dy = next[1] - curr[1]
    const angle = Math.atan2(dy, dx)
    
    // Snap to 0°, 90°, 180°, 270° if close enough
    const snappedAngle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2)
    
    if (Math.abs(angle - snappedAngle) < tolerance) {
      // Adjust next point to align with snapped angle
      const dist = Math.sqrt(dx * dx + dy * dy)
      const newNext: number[] = [
        curr[0] + dist * Math.cos(snappedAngle),
        curr[1] + dist * Math.sin(snappedAngle)
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

/**
 * Remove points that are very close to each other
 */
function removeClosePoints(points: number[][], minDistance: number): number[][] {
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
function ramerDouglasPeucker(points: number[][], tolerance: number): number[][] {
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
function mergeCollinearPoints(points: number[][], tolerance: number): number[][] {
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

/**
 * Calculate perpendicular distance from point to line segment
 */
function perpendicularDistance(
  point: number[],
  lineStart: number[],
  lineEnd: number[]
): number {
  const [px, py] = point
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd

  const dx = x2 - x1
  const dy = y2 - y1

  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
  }

  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)

  let nearestX: number, nearestY: number

  if (t < 0) {
    nearestX = x1
    nearestY = y1
  } else if (t > 1) {
    nearestX = x2
    nearestY = y2
  } else {
    nearestX = x1 + t * dx
    nearestY = y1 + t * dy
  }

  return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2)
}

/**
 * Calculate area of polygon using shoelace formula
 */
function calculateArea(points: number[][]): number {
  let area = 0

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % points.length]
    area += x1 * y2 - x2 * y1
  }

  return Math.abs(area) / 2
}

/**
 * Calculate bounding box
 */
function calculateBoundingBox(points: number[][]) {
  const xs = points.map(p => p[0])
  const ys = points.map(p => p[1])

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * Calculate centroid (center point)
 */
function calculateCentroid(points: number[][]): { x: number; y: number } {
  let x = 0
  let y = 0

  for (const [px, py] of points) {
    x += px
    y += py
  }

  return {
    x: x / points.length,
    y: y / points.length,
  }
}

// ==================== DEBUG VISUALIZATION FUNCTIONS ====================

/**
 * Create a new canvas element
 */
function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * Visualize color clusters on canvas
 */
function visualizeColorClusters(
  imageData: ImageData,
  colors: Array<{ r: number; g: number; b: number; color: string }>,
  tolerance: number,
  targetCanvas: HTMLCanvasElement
): void {
  const ctx = targetCanvas.getContext('2d')!
  const { data, width, height } = imageData
  const outputData = ctx.createImageData(width, height)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < 128) {
      outputData.data[i + 3] = 0
      continue
    }

    // Find closest color cluster
    let minDist = Infinity
    let closestColor = null

    for (const color of colors) {
      const dist = Math.sqrt(
        (r - color.r) ** 2 + (g - color.g) ** 2 + (b - color.b) ** 2
      )
      if (dist < minDist && dist <= tolerance) {
        minDist = dist
        closestColor = color
      }
    }

    if (closestColor) {
      // Color pixels that match clusters
      outputData.data[i] = closestColor.r
      outputData.data[i + 1] = closestColor.g
      outputData.data[i + 2] = closestColor.b
      outputData.data[i + 3] = 255
    } else {
      // Gray out pixels that don't match any cluster
      const gray = (r + g + b) / 3
      outputData.data[i] = gray
      outputData.data[i + 1] = gray
      outputData.data[i + 2] = gray
      outputData.data[i + 3] = 100
    }
  }

  ctx.putImageData(outputData, 0, 0)
}

/**
 * Visualize a binary mask as white pixels on black background
 */
function visualizeMask(
  mask: Uint8Array,
  width: number,
  height: number,
  targetCanvas: HTMLCanvasElement
): void {
  const ctx = targetCanvas.getContext('2d')!
  const imageData = ctx.createImageData(width, height)

  for (let i = 0; i < mask.length; i++) {
    const pixelIdx = i * 4
    if (mask[i]) {
      imageData.data[pixelIdx] = 255 // R
      imageData.data[pixelIdx + 1] = 255 // G
      imageData.data[pixelIdx + 2] = 255 // B
      imageData.data[pixelIdx + 3] = 255 // A
    } else {
      imageData.data[pixelIdx] = 0
      imageData.data[pixelIdx + 1] = 0
      imageData.data[pixelIdx + 2] = 0
      imageData.data[pixelIdx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Visualize detected contours overlaid on original image
 */
function visualizeContours(
  sourceCanvas: HTMLCanvasElement,
  polygons: DetectedPolygon[],
  targetCanvas: HTMLCanvasElement
): void {
  const ctx = targetCanvas.getContext('2d')!

  // Draw original image
  ctx.drawImage(sourceCanvas, 0, 0)

  // Draw each polygon
  polygons.forEach((polygon, index) => {
    ctx.beginPath()
    ctx.strokeStyle = `hsl(${(index * 360) / polygons.length}, 100%, 50%)`
    ctx.lineWidth = 3
    ctx.fillStyle = `hsla(${(index * 360) / polygons.length}, 100%, 50%, 0.2)`

    // Draw polygon path
    const [firstX, firstY] = polygon.points[0]
    ctx.moveTo(firstX, firstY)

    for (let i = 1; i < polygon.points.length; i++) {
      const [x, y] = polygon.points[i]
      ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Draw centroid
    ctx.beginPath()
    ctx.arc(polygon.centroid.x, polygon.centroid.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = 'red'
    ctx.fill()

    // Draw label
    ctx.fillStyle = 'black'
    ctx.font = 'bold 16px Arial'
    ctx.fillText(
      `#${index + 1}`,
      polygon.centroid.x + 10,
      polygon.centroid.y - 10
    )
  })
}

// ==================== PARAMETER TUNING UTILITIES ====================

/**
 * Get debug visualization from detection results
 */
export function getDebugVisualization(
  polygons: DetectedPolygon[]
): DebugVisualization | null {
  return (polygons as unknown as { __debug?: DebugVisualization }).__debug || null
}

/**
 * Suggest optimal parameters based on image analysis
 */
export async function suggestParameters(
  imageFile: File
): Promise<Partial<DetectionOptions>> {
  const img = await loadImage(imageFile)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const totalPixels = imageData.width * imageData.height
  const imageSize = totalPixels

  // Analyze image
  const colors = findApartmentColors(imageData)
  const avgColorCount = colors.length

  // Calculate expected apartment count based on colors
  // Usually 1-3 colors per apartment (main color + variations)
  const estimatedApartments = Math.max(8, Math.min(15, Math.floor(avgColorCount / 1.5)))
  
  // Calculate minArea based on expected number of apartments
  // Each apartment should be at least 1-2% of total image
  const minAreaByCount = Math.floor(imageSize / estimatedApartments / 2)
  
  // Also consider absolute minimum based on image size
  const minAreaBySize = Math.max(500, Math.floor(imageSize / 300))
  
  // Use the smaller of the two (more permissive)
  const minArea = Math.min(minAreaByCount, minAreaBySize)

  // Suggest parameters
  const suggestions: Partial<DetectionOptions> = {
    minArea: Math.max(500, minArea), // At least 500 pixels, but usually more
    maxArea: Math.floor(imageSize / 2), // Max 50% of image
    colorTolerance: avgColorCount > 15 ? 50 : avgColorCount > 10 ? 40 : 30,
    simplifyTolerance: Math.max(6, Math.min(12, Math.floor(Math.min(img.width, img.height) / 150))),
    morphRadius: Math.max(3, Math.min(7, Math.floor(Math.min(img.width, img.height) / 400))),
    cornerAngleThreshold: 15,
  }

  console.log('📊 Image Analysis:')
  console.log(`  - Dimensions: ${img.width}x${img.height} (${totalPixels.toLocaleString()} pixels)`)
  console.log(`  - Detected ${avgColorCount} distinct colors`)
  console.log(`  - Estimated ${estimatedApartments} apartments`)
  console.log(`  - Min area per apartment: ~${Math.floor(imageSize / estimatedApartments).toLocaleString()} pixels`)
  console.log('📐 Suggested parameters:', suggestions)

  return suggestions
}

/**
 * Test detection with multiple parameter sets and compare results
 */
export async function compareParameters(
  imageFile: File,
  parameterSets: Array<{ name: string; options: DetectionOptions }>
): Promise<
  Array<{
    name: string
    polygonCount: number
    averageArea: number
    polygons: DetectedPolygon[]
  }>
> {
  const results = []

  for (const { name, options } of parameterSets) {
    console.log(`\n=== Testing ${name} ===`)
    const polygons = await detectApartmentPolygons(imageFile, options)

    const averageArea =
      polygons.length > 0
        ? polygons.reduce((sum, p) => sum + p.area, 0) / polygons.length
        : 0

    results.push({
      name,
      polygonCount: polygons.length,
      averageArea: Math.round(averageArea),
      polygons,
    })

    console.log(`${name}: Found ${polygons.length} polygons, avg area: ${Math.round(averageArea)}`)
  }

  return results
}

/**
 * Create preset parameter configurations for common scenarios
 */
export const PRESET_PARAMETERS = {
  /** High precision - detects small apartments, more detailed polygons */
  highPrecision: {
    minArea: 500,
    colorTolerance: 25,
    simplifyTolerance: 5.0,
    morphRadius: 3,
    cornerAngleThreshold: 10,
  } as DetectionOptions,

  /** Balanced - good for most floor plans with clean straight edges */
  balanced: {
    minArea: 1500,
    colorTolerance: 40,
    simplifyTolerance: 8.0,
    morphRadius: 5,
    cornerAngleThreshold: 15,
  } as DetectionOptions,

  /** Robust - filters noise, merges details, very clean polygons with minimal points */
  robust: {
    minArea: 5000,
    colorTolerance: 50,
    simplifyTolerance: 12.0,
    morphRadius: 7,
    cornerAngleThreshold: 20,
  } as DetectionOptions,

  /** Large buildings - for floor plans with large apartments */
  largeBuildingts: {
    minArea: 10000,
    colorTolerance: 45,
    simplifyTolerance: 15.0,
    morphRadius: 8,
    cornerAngleThreshold: 20,
  } as DetectionOptions,

  /** Many apartments - for complex floor plans with 10+ apartments, clean edges */
  manyApartments: {
    minArea: 800,
    colorTolerance: 35,
    simplifyTolerance: 7.0,
    morphRadius: 4,
    cornerAngleThreshold: 12,
  } as DetectionOptions,
}
