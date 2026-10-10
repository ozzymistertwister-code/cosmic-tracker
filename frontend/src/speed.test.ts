import { describe, expect, it } from 'vitest'
import { formatSpeedKmh, kmhFromKms } from './speed'

describe('heliocentric speed conversion', () => {
  it('converts Parker reference speed without dropping the factor of 3600', () => {
    expect(kmhFromKms(29.84)).toBeCloseTo(107424, 8)
    expect(formatSpeedKmh(29.84)).toBe('107 424 км/ч')
  })

  it('converts other speeds using the same units', () => {
    expect(kmhFromKms(1)).toBe(3600)
    expect(kmhFromKms(0)).toBe(0)
    expect(kmhFromKms(11.2)).toBeCloseTo(40320, 8)
  })

  it('rounds only the displayed km/h value', () => {
    expect(kmhFromKms(0.12345)).toBeCloseTo(444.42, 8)
    expect(formatSpeedKmh(0.12345)).toBe('444 км/ч')
  })
})
