import { describe, expect, it } from 'vitest'
import { clampScale, initialScale, MAX_RELATIVE_SCALE, zoomPercentage } from './mapView'

describe('map zoom limits', () => {
  it('uses the same 2000x relative ceiling in both maps', () => {
    expect(zoomPercentage('solar', clampScale('solar', Infinity))).toBe(200000)
    expect(zoomPercentage('deep', clampScale('deep', Infinity))).toBe(200000)
    expect(clampScale('solar', Infinity)).toBe(initialScale('solar') * MAX_RELATIVE_SCALE)
    expect(clampScale('deep', Infinity)).toBe(initialScale('deep') * MAX_RELATIVE_SCALE)
  })

  it('keeps a lower safety bound for wheel/pinch underflow', () => {
    expect(clampScale('solar', 0)).toBe(initialScale('solar') * .15)
  })
})
