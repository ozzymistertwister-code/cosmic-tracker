import type { EphemerisResponse } from './domain'

export async function loadEphemerides(ids: string[], date: Date, mode: 'solar' | 'deep'): Promise<EphemerisResponse> {
  const spanDays = mode === 'solar' ? 180 : 3650
  const start = new Date(date.getTime() - spanDays * 86400000)
  const end = new Date(date.getTime() + spanDays * 86400000)
  // Parker Solar Probe needs daily control points near perihelion; deep-space
  // missions can use a coarser series without sacrificing the map scale.
  const step = mode === 'solar' ? '1 d' : '30 d'
  const query = new URLSearchParams({ ids: ids.join(','), start: start.toISOString(), end: end.toISOString(), step })
  const apiBase = import.meta.env.DEV ? '/api' : `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api`
  const response = await fetch(`${apiBase}/ephemerides?${query}`)
  if (!response.ok) throw new Error(`API вернул HTTP ${response.status}`)
  return response.json() as Promise<EphemerisResponse>
}

