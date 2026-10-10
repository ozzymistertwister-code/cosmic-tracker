import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type WheelEvent } from 'react'
import type { Mode, SpaceObject } from './domain'
import { AU_KM } from './domain'

type Props = { mode: Mode; objects: SpaceObject[]; selected: string; onSelect: (id: string) => void; loading: boolean }
type Point = { x: number; y: number; id: string; radius: number }
type View = { scale: number; panX: number; panY: number }
type ActivePointer = { x: number; y: number }

const initialScale = (mode: Mode) => mode === 'deep' ? 1.7 : 15
const clampScale = (scale: number) => Math.max(.15, Math.min(90, scale))

export function MapCanvas({ mode, objects, selected, onSelect, loading }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [view, setView] = useState<View>({ scale: initialScale(mode), panX: 0, panY: 0 })
  const points = useRef<Point[]>([])
  const activePointers = useRef(new Map<number, ActivePointer>())
  const lastPointer = useRef<ActivePointer | null>(null)
  const suppressClick = useRef(false)
  const pinchStart = useRef<{ distance: number; center: ActivePointer; scale: number; panX: number; panY: number } | null>(null)

  const resetView = useCallback(() => setView({ scale: initialScale(mode), panX: 0, panY: 0 }), [mode])
  const zoom = useCallback((factor: number) => setView((current) => ({ ...current, scale: clampScale(current.scale * factor) })), [])

  useEffect(() => { setView({ scale: initialScale(mode), panX: 0, panY: 0 }) }, [mode])

  const draw = useCallback(() => {
    const canvas = canvasRef.current; const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const rect = canvas.getBoundingClientRect(); const w = rect.width; const h = rect.height
    context.clearRect(0, 0, w, h)
    const gradient = context.createRadialGradient(w * .48, h * .48, 0, w * .48, h * .48, Math.max(w, h) * .7)
    gradient.addColorStop(0, '#112331'); gradient.addColorStop(1, '#071019'); context.fillStyle = gradient; context.fillRect(0, 0, w, h)
    const cx = w / 2 + view.panX; const cy = h / 2 + view.panY
    const toScreen = (x: number, y: number) => ({ x: cx + x / AU_KM * view.scale, y: cy - y / AU_KM * view.scale })
    context.strokeStyle = 'rgba(139, 183, 204, .10)'; context.lineWidth = 1
    for (let i = -10; i <= 10; i++) { const gx = cx + i * (mode === 'deep' ? 50 : 40); const gy = cy + i * (mode === 'deep' ? 50 : 40); context.beginPath(); context.moveTo(gx, 0); context.lineTo(gx, h); context.stroke(); context.beginPath(); context.moveTo(0, gy); context.lineTo(w, gy); context.stroke() }
    const max = mode === 'deep' ? 250 : 32
    context.strokeStyle = 'rgba(169, 213, 229, .42)'; context.setLineDash([4, 6]); context.beginPath(); context.arc(cx, cy, max * view.scale, 0, Math.PI * 2); context.stroke(); context.setLineDash([])
    context.fillStyle = '#8da8b5'; context.font = '11px IBM Plex Mono, monospace'; context.fillText(`${max} а.е.`, Math.min(w - 56, cx + max * view.scale - 20), cy - 7)
    points.current = []
    objects.filter((object) => object.mode.includes(mode) && object.data).forEach((object) => {
      const data = object.data!; const screen = toScreen(data.x, data.y); const radius = object.kind === 'planet' ? 4.5 : object.kind === 'sun' ? 9 : 6.5
      const trajectory = data.path
      if (trajectory && trajectory.length > 1) { context.beginPath(); trajectory.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? context.lineTo(q.x, q.y) : context.moveTo(q.x, q.y) }); context.strokeStyle = `${object.color}55`; context.lineWidth = object.id === selected ? 2 : 1; context.stroke() }
      if (object.id === selected) { context.beginPath(); context.arc(screen.x, screen.y, radius + 8, 0, Math.PI * 2); context.strokeStyle = object.color; context.lineWidth = 1; context.stroke() }
      context.beginPath(); context.arc(screen.x, screen.y, radius, 0, Math.PI * 2); context.fillStyle = object.color; context.shadowColor = object.color; context.shadowBlur = object.kind === 'sun' ? 20 : 8; context.fill(); context.shadowBlur = 0
      context.font = object.id === selected ? '600 12px IBM Plex Sans, sans-serif' : '11px IBM Plex Sans, sans-serif'; context.fillStyle = object.id === selected ? '#f4fbff' : '#b7ccd4'; context.fillText(object.shortName, screen.x + radius + 5, screen.y + 4)
      points.current.push({ x: screen.x, y: screen.y, id: object.id, radius: radius + 9 })
    })
    context.fillStyle = '#f3c76b'; context.font = '11px IBM Plex Mono, monospace'; context.fillText(mode === 'deep' ? 'Гелиоцентрическая проекция · линейная шкала AU' : 'Гелиоцентрическая проекция · эклиптика J2000', 20, h - 20)
    if (loading) { context.fillStyle = 'rgba(7,16,25,.65)'; context.fillRect(0, 0, w, h); context.fillStyle = '#e5f4fa'; context.font = '600 14px IBM Plex Sans, sans-serif'; context.fillText('Получаем эфемериды NASA/JPL Horizons…', 24, 34) }
  }, [loading, mode, objects, selected, view])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => { const rect = canvas.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1; canvas.width = Math.max(1, Math.round(rect.width * dpr)); canvas.height = Math.max(1, Math.round(rect.height * dpr)); canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0); draw() }
    resize(); const observer = new ResizeObserver(resize); observer.observe(canvas); return () => observer.disconnect()
  }, [draw])

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    suppressClick.current = false; activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); event.currentTarget.setPointerCapture(event.pointerId)
    if (activePointers.current.size === 1) lastPointer.current = { x: event.clientX, y: event.clientY }
    if (activePointers.current.size === 2) { const [a, b] = [...activePointers.current.values()]; pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, scale: view.scale, panX: view.panX, panY: view.panY } }
  }
  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!activePointers.current.has(event.pointerId)) return
    activePointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (activePointers.current.size >= 2 && pinchStart.current) { const [a, b] = [...activePointers.current.values()]; const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; const distance = Math.hypot(a.x - b.x, a.y - b.y); const pinch = pinchStart.current; if (Math.abs(distance - pinch.distance) > 2) suppressClick.current = true; setView({ scale: clampScale(pinch.scale * distance / pinch.distance), panX: pinch.panX + center.x - pinch.center.x, panY: pinch.panY + center.y - pinch.center.y }); return }
    if (activePointers.current.size === 1 && lastPointer.current) { const dx = event.clientX - lastPointer.current.x; const dy = event.clientY - lastPointer.current.y; if (Math.hypot(dx, dy) > 2) suppressClick.current = true; setView((current) => ({ ...current, panX: current.panX + dx, panY: current.panY + dy })); lastPointer.current = { x: event.clientX, y: event.clientY } }
  }
  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => { activePointers.current.delete(event.pointerId); pinchStart.current = null; lastPointer.current = [...activePointers.current.values()][0] ?? null }
  const click = (event: MouseEvent<HTMLCanvasElement>) => { if (suppressClick.current) { suppressClick.current = false; return }; const rect = event.currentTarget.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const hit = points.current.find((point) => Math.hypot(point.x - x, point.y - y) < point.radius); if (hit) onSelect(hit.id) }
  const wheel = (event: WheelEvent<HTMLCanvasElement>) => { event.preventDefault(); zoom(event.deltaY > 0 ? .8 : 1.25) }
  const keyDown = (event: KeyboardEvent<HTMLCanvasElement>) => { if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.25) } else if (event.key === '-') { event.preventDefault(); zoom(.8) } else if (event.key === '0') { event.preventDefault(); resetView() } else if (event.key.startsWith('Arrow')) { event.preventDefault(); const delta = event.shiftKey ? 40 : 18; setView((current) => ({ ...current, panX: current.panX + (event.key === 'ArrowRight' ? delta : event.key === 'ArrowLeft' ? -delta : 0), panY: current.panY + (event.key === 'ArrowDown' ? delta : event.key === 'ArrowUp' ? -delta : 0) })) } }
  const percentage = Math.round(view.scale / initialScale(mode) * 100)
  return <div className="map-canvas-shell"><canvas ref={canvasRef} className="map-canvas" tabIndex={0} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onClick={click} onWheel={wheel} onKeyDown={keyDown} aria-label="Интерактивная карта эфемерид: стрелки — панорама, плюс/минус — масштаб" /><div className="map-zoom-controls" aria-label="Управление масштабом карты"><button type="button" onClick={() => zoom(1.25)} aria-label="Увеличить масштаб">⌕<span>+</span></button><button type="button" onClick={() => zoom(.8)} aria-label="Уменьшить масштаб">⌕<span>−</span></button><output aria-live="polite">{percentage}%</output><button type="button" onClick={resetView} aria-label="Восстановить масштаб и центрирование">100%</button></div></div>
}
