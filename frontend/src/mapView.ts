import type { Mode } from './domain'

export const MAX_RELATIVE_SCALE = 2000
export const initialScale = (mode: Mode) => mode === 'deep' ? 1.7 : 15
export const clampScale = (mode: Mode, scale: number) => {
  const base = initialScale(mode)
  return Math.max(base * .15, Math.min(base * MAX_RELATIVE_SCALE, scale))
}

export const zoomPercentage = (mode: Mode, scale: number) => Math.round(scale / initialScale(mode) * 100)
