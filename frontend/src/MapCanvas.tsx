import { useEffect, useRef, type MouseEvent, type PointerEvent, type WheelEvent } from 'react'
import type { Mode, SpaceObject } from './domain'
import { AU_KM } from './domain'

type Props = { mode: Mode; objects: SpaceObject[]; selected: string; onSelect: (id: string) => void; loading: boolean }
type Point = { x: number; y: number; id: string; radius: number }

export function MapCanvas({ mode, objects, selected, onSelect, loading }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const view = useRef({ scale: mode === 'deep' ? 1.7 : 15, panX: 0, panY: 0, dragging: false, lastX: 0, lastY: 0 })
  const points = useRef<Point[]>([])

  useEffect(() => { view.current = { scale: mode === 'deep' ? 1.7 : 15, panX: 0, panY: 0, dragging: false, lastX: 0, lastY: 0 } }, [mode])
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; context.setTransform(dpr, 0, 0, dpr, 0, 0); draw()
    }
    const draw = () => {
      const rect = canvas.getBoundingClientRect(); const w = rect.width; const h = rect.height
      context.clearRect(0, 0, w, h)
      const gradient = context.createRadialGradient(w * .48, h * .48, 0, w * .48, h * .48, Math.max(w, h) * .7)
      gradient.addColorStop(0, '#112331'); gradient.addColorStop(1, '#071019'); context.fillStyle = gradient; context.fillRect(0, 0, w, h)
      const v = view.current; const cx = w / 2 + v.panX; const cy = h / 2 + v.panY
      const toScreen = (x: number, y: number) => ({ x: cx + x / AU_KM * v.scale, y: cy - y / AU_KM * v.scale })
      context.strokeStyle = 'rgba(139, 183, 204, .10)'; context.lineWidth = 1
      for (let i = -10; i <= 10; i++) { const gx = cx + i * (mode === 'deep' ? 50 : 40); const gy = cy + i * (mode === 'deep' ? 50 : 40); context.beginPath(); context.moveTo(gx, 0); context.lineTo(gx, h); context.stroke(); context.beginPath(); context.moveTo(0, gy); context.lineTo(w, gy); context.stroke() }
      const max = mode === 'deep' ? 250 : 32
      context.strokeStyle = 'rgba(169, 213, 229, .42)'; context.setLineDash([4, 6]); context.beginPath(); const maxPx = max * AU_KM * v.scale / AU_KM; context.arc(cx, cy, maxPx, 0, Math.PI * 2); context.stroke(); context.setLineDash([])
      context.fillStyle = '#8da8b5'; context.font = '11px IBM Plex Mono, monospace'; context.fillText(`${max} а.е.`, Math.min(w - 56, cx + maxPx - 20), cy - 7)
      points.current = []
      objects.filter(o => o.mode.includes(mode) && o.data).forEach(object => {
        const data = object.data!; const screen = toScreen(data.x, data.y); const radius = object.kind === 'planet' ? 4.5 : object.kind === 'sun' ? 9 : 6.5
        const trajectory = object.data && object.data.path
        if (trajectory && trajectory.length > 1) { context.beginPath(); trajectory.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? context.lineTo(q.x, q.y) : context.moveTo(q.x, q.y) }); context.strokeStyle = `${object.color}55`; context.lineWidth = object.id === selected ? 2 : 1; context.stroke() }
        if (object.id === selected) { context.beginPath(); context.arc(screen.x, screen.y, radius + 8, 0, Math.PI * 2); context.strokeStyle = object.color; context.lineWidth = 1; context.stroke() }
        context.beginPath(); context.arc(screen.x, screen.y, radius, 0, Math.PI * 2); context.fillStyle = object.color; context.shadowColor = object.color; context.shadowBlur = object.kind === 'sun' ? 20 : 8; context.fill(); context.shadowBlur = 0
        const label = object.shortName; context.font = object.id === selected ? '600 12px IBM Plex Sans, sans-serif' : '11px IBM Plex Sans, sans-serif'; context.fillStyle = object.id === selected ? '#f4fbff' : '#b7ccd4'; context.fillText(label, screen.x + radius + 5, screen.y + 4)
        points.current.push({ x: screen.x, y: screen.y, id: object.id, radius: radius + 9 })
      })
      context.fillStyle = '#f3c76b'; context.font = '11px IBM Plex Mono, monospace'; context.fillText(mode === 'deep' ? 'Гелиоцентрическая проекция · линейная шкала AU' : 'Гелиоцентрическая проекция · эклиптика J2000', 20, h - 20)
      if (loading) { context.fillStyle = 'rgba(7,16,25,.65)'; context.fillRect(0, 0, w, h); context.fillStyle = '#e5f4fa'; context.font = '600 14px IBM Plex Sans, sans-serif'; context.fillText('Получаем эфемериды NASA/JPL Horizons…', 24, 34) }
    }
    resize(); const observer = new ResizeObserver(resize); observer.observe(canvas); return () => observer.disconnect()
  }, [mode, objects, selected, loading])

  const redraw = () => { const event = new Event('resize'); window.dispatchEvent(event) }
  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => { view.current.dragging = true; view.current.lastX = event.clientX; view.current.lastY = event.clientY; event.currentTarget.setPointerCapture(event.pointerId) }
  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => { if (!view.current.dragging) return; view.current.panX += event.clientX - view.current.lastX; view.current.panY += event.clientY - view.current.lastY; view.current.lastX = event.clientX; view.current.lastY = event.clientY; redraw() }
  const pointerUp = () => { view.current.dragging = false }
  const click = (event: MouseEvent<HTMLCanvasElement>) => { if (view.current.dragging) return; const rect = event.currentTarget.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const hit = points.current.find(p => Math.hypot(p.x - x, p.y - y) < p.radius); if (hit) onSelect(hit.id) }
  const wheel = (event: WheelEvent<HTMLCanvasElement>) => { event.preventDefault(); view.current.scale = Math.max(.15, Math.min(90, view.current.scale * (event.deltaY > 0 ? .88 : 1.14))); redraw() }
  return <canvas ref={canvasRef} className="map-canvas" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onClick={click} onWheel={wheel} aria-label="Интерактивная карта эфемерид" />
}

