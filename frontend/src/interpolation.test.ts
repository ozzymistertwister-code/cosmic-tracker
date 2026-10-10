import { describe, expect, it } from 'vitest'
import { interpolateEphemeris } from './interpolation'
import type { EphemerisPoint } from './domain'

const point = (epochTdb: string, x: number): EphemerisPoint => ({
  timestamp: epochTdb, epochTdb, epochUtc: epochTdb, x, y: 0, z: 0, vx: 10, vy: 0, vz: 0, source: 'fixture', coverage: 'reconstructed',
})

describe('Horizons state interpolation', () => {
  it('uses a Hermite state between samples without extrapolating', () => {
    const points = [point('2026-01-01T00:00:00Z', 0), point('2026-01-02T00:00:00Z', 864000)]
    const result = interpolateEphemeris(points, new Date('2026-01-01T12:00:00Z'))
    expect(result?.interpolation).toBe('hermite')
    expect(result?.x).toBeCloseTo(432000, 5)
    expect(result?.vx).toBeCloseTo(10, 5)
    expect(result?.bracketEpochTdb).toEqual(['2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z'])
    expect(interpolateEphemeris(points, new Date('2025-12-31T23:00:00Z'))).toBeUndefined()
  })

  it('marks an exact Horizons sample as measured data', () => {
    const result = interpolateEphemeris([point('2026-01-01T00:00:00Z', 12)], new Date('2026-01-01T00:00:00Z'))
    expect(result?.interpolation).toBe('sampled')
    expect(result?.interpolationErrorKm).toBe(0)
  })
})
