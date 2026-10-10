import { describe, expect, it } from 'vitest'
import { distance, norm } from './domain'

describe('astronomical vector math', () => {
  it('computes norms in source units', () => {
    expect(norm({ x: 3, y: 4, z: 0 })).toBe(5)
  })
  it('computes distance between simultaneous state vectors', () => {
    expect(distance({ x: 3, y: 0, z: 0 }, { x: 0, y: 4, z: 0 })).toBe(5)
  })
})
