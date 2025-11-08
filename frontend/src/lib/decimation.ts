/**
 * Largest Triangle Three Bucket (LTTB) data decimation algorithm
 * Reduces large time-series datasets while preserving visual fidelity
 * Based on the paper: "Downsampling Time Series for Visual Representation" by Sveinn Steinarsson
 */

export interface DataPoint {
  time: number | string | Date
  value?: number // Optional for flexibility with different property names
  [key: string]: any // Allow additional properties
}

/**
 * Convert time to numeric timestamp for calculations
 */
function toTimestamp(time: number | string | Date): number {
  if (typeof time === 'number') return time
  if (typeof time === 'string') return new Date(time).getTime()
  return time.getTime()
}

/**
 * Calculate the area of a triangle formed by three points
 * Uses the cross product method for area calculation
 */
function triangleArea(a: DataPoint, b: DataPoint, c: DataPoint, valueKey: string = 'value'): number {
  const ax = toTimestamp(a.time)
  const ay = a[valueKey] || a.value || 0
  const bx = toTimestamp(b.time)
  const by = b[valueKey] || b.value || 0
  const cx = toTimestamp(c.time)
  const cy = c[valueKey] || c.value || 0

  return Math.abs((ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2)
}

/**
 * Largest Triangle Three Bucket data decimation
 * @param data Array of data points with time and value properties
 * @param threshold Maximum number of points to keep
 * @param valueKey Property name for the value field (default: 'value')
 * @returns Decimated array of data points
 */
export function lttbDecimation(data: DataPoint[], threshold: number, valueKey: string = 'value'): DataPoint[] {
  if (data.length <= threshold || threshold <= 2) {
    return data.slice() // Return copy if no decimation needed
  }

  const decimated: DataPoint[] = new Array(threshold)
  const bucketSize = (data.length - 2) / (threshold - 2)

  // Always include first point
  decimated[0] = data[0]

  // Always include last point
  decimated[threshold - 1] = data[data.length - 1]

  let nextBucketStart = 1
  let nextBucketEnd = Math.floor(bucketSize) + 1

  for (let i = 1; i < threshold - 1; i++) {
    const bucketStart = nextBucketStart
    const bucketEnd = Math.min(Math.floor(nextBucketEnd), data.length - 1)

    let maxArea = -1
    let maxAreaPoint = bucketStart

    // Find point with maximum triangle area in this bucket
    for (let j = bucketStart; j < bucketEnd; j++) {
      const area = triangleArea(
        decimated[i - 1], // Previous selected point
        data[j],          // Current candidate point
        data[bucketEnd],  // Next bucket's end point (or final point)
        valueKey
      )

      if (area > maxArea) {
        maxArea = area
        maxAreaPoint = j
      }
    }

    decimated[i] = data[maxAreaPoint]
    nextBucketStart = bucketEnd
    nextBucketEnd += bucketSize
  }

  return decimated
}

/**
 * Smart decimation that automatically determines threshold based on data size
 * @param data Array of data points
 * @param maxPoints Maximum points to display (default: 1000)
 * @param valueKey Property name for the value field (default: 'value')
 * @returns Decimated data or original if small enough
 */
export function smartDecimation(data: DataPoint[], maxPoints: number = 1000, valueKey: string = 'value'): DataPoint[] {
  if (!data || data.length === 0) return []
  if (data.length <= maxPoints) return data

  return lttbDecimation(data, maxPoints, valueKey)
}

/**
 * Decimation specifically for time-series chart data
 * Handles common chart data formats
 */
export function decimateTimeSeries(
  data: Array<{ time: any; value: number; [key: string]: any }>,
  maxPoints: number = 1000
): Array<{ time: any; value: number; [key: string]: any }> {
  return smartDecimation(data, maxPoints, 'value') as Array<{ time: any; value: number; [key: string]: any }>
}