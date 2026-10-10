import { norm, type EphemerisPoint } from './domain'

const epochMs = (point: EphemerisPoint) => point.epochUtc ? Date.parse(point.epochUtc) : Number.NaN

export function interpolateEphemeris(points: EphemerisPoint[], target: Date): EphemerisPoint | undefined {
  const usable = points
    .map((point) => ({ point, time: epochMs(point) }))
    .filter((item) => Number.isFinite(item.time))
    .sort((a, b) => a.time - b.time)
  if (!usable.length) return undefined

  const targetMs = target.getTime()
  const exact = usable.find((item) => Math.abs(item.time - targetMs) < 1000)
  if (exact) return { ...exact.point, interpolation: 'sampled', requestedEpochUtc: target.toISOString(), interpolationErrorKm: 0 }

  const rightIndex = usable.findIndex((item) => item.time > targetMs)
  if (rightIndex <= 0) return undefined
  const left = usable[rightIndex - 1]
  const right = usable[rightIndex]
  const dt = (right.time - left.time) / 1000
  const u = (targetMs - left.time) / (right.time - left.time)
  if (!(dt > 0) || u < 0 || u > 1) return undefined

  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1
  const h10 = u ** 3 - 2 * u ** 2 + u
  const h01 = -2 * u ** 3 + 3 * u ** 2
  const h11 = u ** 3 - u ** 2
  const dh00 = 6 * u ** 2 - 6 * u
  const dh10 = 3 * u ** 2 - 4 * u + 1
  const dh01 = -6 * u ** 2 + 6 * u
  const dh11 = 3 * u ** 2 - 2 * u
  const interpolate = (a: number, av: number, b: number, bv: number) => h00 * a + h10 * dt * av + h01 * b + h11 * dt * bv
  const derivative = (a: number, av: number, b: number, bv: number) => (dh00 * a + dh10 * dt * av + dh01 * b + dh11 * dt * bv) / dt
  const position = { x: interpolate(left.point.x, left.point.vx, right.point.x, right.point.vx), y: interpolate(left.point.y, left.point.vy, right.point.y, right.point.vy), z: interpolate(left.point.z, left.point.vz, right.point.z, right.point.vz) }
  const linear = { x: left.point.x + (right.point.x - left.point.x) * u, y: left.point.y + (right.point.y - left.point.y) * u, z: left.point.z + (right.point.z - left.point.z) * u }

  return {
    ...left.point,
    ...position,
    vx: derivative(left.point.x, left.point.vx, right.point.x, right.point.vx),
    vy: derivative(left.point.y, left.point.vy, right.point.y, right.point.vy),
    vz: derivative(left.point.z, left.point.vz, right.point.z, right.point.vz),
    epochTdb: undefined,
    interpolation: 'hermite',
    requestedEpochUtc: target.toISOString(),
    bracketEpochTdb: [left.point.epochTdb ?? left.point.timestamp, right.point.epochTdb ?? right.point.timestamp],
    interpolationErrorKm: norm({ x: position.x - linear.x, y: position.y - linear.y, z: position.z - linear.z }),
  }
}
