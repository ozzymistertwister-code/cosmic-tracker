import { useEffect, useMemo, useState } from 'react'
import { loadEphemerides } from './api'
import { AU_KM, catalog, distance, norm, type EphemerisResponse, type Mode, type SpaceObject } from './domain'
import { interpolateEphemeris } from './interpolation'
import { MapCanvas } from './MapCanvas'
import { formatSpeedKmh } from './speed'
import './styles.css'

const dateLabel = (value: Date) => new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(value)
const km = (value: number) => value > AU_KM * .01 ? `${(value / AU_KM).toFixed(2)} а.е.` : `${Math.round(value).toLocaleString('ru-RU')} км`
const speed = (value: number) => `${value.toFixed(2)} км/с`

function App() {
  const [mode, setMode] = useState<Mode>('solar')
  const [date, setDate] = useState(() => new Date())
  const [queryDate, setQueryDate] = useState(date)
  const [selected, setSelected] = useState('earth')
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<EphemerisResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [playbackStep, setPlaybackStep] = useState(1)
  const timelineAnchor = useMemo(() => new Date(), [])

  const requestIds = mode === 'solar'
    ? catalog.filter(object => object.mode.includes('solar')).map(object => object.id)
    : ['sun', 'earth', 'jupiter', 'saturn', 'uranus', 'neptune', 'voyager1', 'voyager2', 'new-horizons']

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    loadEphemerides(requestIds, queryDate, mode).then(data => { if (!cancelled) setResponse(data) }).catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось загрузить эфемериды') }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [mode, queryDate])
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setDate(value => new Date(value.getTime() + playbackStep * 86400000)), 1000); return () => window.clearInterval(timer) }, [playing, playbackStep])
  useEffect(() => {
    if (!response) return
    const times = Object.values(response.objects).flatMap(item => item.points.map(point => point.epochUtc ? Date.parse(point.epochUtc) : Number.NaN)).filter(Number.isFinite)
    if (!times.length || (date.getTime() >= Math.min(...times) && date.getTime() <= Math.max(...times))) return
    const timer = window.setTimeout(() => setQueryDate(date), 450)
    return () => window.clearTimeout(timer)
  }, [date, response])

  const objects = useMemo<SpaceObject[]>(() => catalog.map(object => {
    const item = response?.objects[object.id]; const points = item?.points ?? []
    const interpolated = interpolateEphemeris(points, date)
    return { ...object, data: interpolated ? { ...interpolated, path: points.map(p => ({ x: p.x, y: p.y })) } : undefined, error: item?.error, sourceStatus: item?.sourceStatus }
  }), [response, date])
  const visible = objects.filter(o => o.mode.includes(mode) && (o.name.toLowerCase().includes(query.toLowerCase()) || o.shortName.toLowerCase().includes(query.toLowerCase())))
  const selectedObject = visible.find(o => o.id === selected) ?? visible[0] ?? objects[0]
  const earth = objects.find(o => o.id === 'earth')?.data
  const dataStatus = loading ? 'LOADING' : response ? (Object.values(response.objects).some(v => v.sourceStatus === 'live') ? 'LIVE' : Object.values(response.objects).some(v => v.sourceStatus === 'cached') ? 'CACHED' : 'UNAVAILABLE') : '—'

  const shiftDate = (days: number) => setDate(value => new Date(value.getTime() + days * 86400000))
  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span><div><strong>Cosmic Tracker</strong><span>эфемериды, которым можно доверять</span></div></div>
      <div className="source-chip"><span className={`status-dot ${dataStatus.toLowerCase()}`} />{dataStatus} · NASA/JPL Horizons</div>
    </header>
    <section className="intro-row"><div><p className="eyebrow">Интерактивный атлас · TDB → UTC</p><h1>Где находятся<br /><em>наши аппараты?</em></h1></div><p className="intro-copy">Реальные векторы положения и скорости в эклиптической плоскости J2000. Выберите эпоху, чтобы увидеть, как меняется геометрия миссий.</p></section>
    <nav className="mode-tabs" aria-label="Режим карты"><button className={mode === 'solar' ? 'active' : ''} onClick={() => setMode('solar')}><span>01</span>Солнечная система</button><button className={mode === 'deep' ? 'active' : ''} onClick={() => setMode('deep')}><span>02</span>Дальний космос</button></nav>
    <section className="workspace">
      <div className="map-panel"><div className="map-header"><div><p className="eyebrow">{mode === 'deep' ? 'Гелиоцентрическая карта · 0—250 а.е.' : 'Гелиоцентрическая карта · 0—32 а.е.'}</p><h2>{mode === 'deep' ? 'За пределами планет' : 'Планеты и исследователи'}</h2></div><div className="map-actions"><button onClick={() => setDate(new Date())}>Сейчас</button><span>колёсико — масштаб<br />перетаскивание — панорама</span></div></div><div className="canvas-wrap"><MapCanvas mode={mode} objects={visible} selected={selectedObject.id} onSelect={setSelected} loading={loading} /><div className="map-legend"><span><i className="legend-orbit" />траектория Horizons</span><span><i className="legend-dot" />выбрано</span></div>{error && <div className="error-banner">{error}. Проверьте соединение с NASA Horizons — live-координаты не подменяются.</div>}</div><div className="axis-note"><span>X — направление весеннего равноденствия</span><span>Y ↑ в плоскости эклиптики</span><span>Маркеры увеличены для читаемости</span></div></div>
      <aside className="inspector"><div className="inspector-head"><div><p className="eyebrow">Объект наблюдения</p><h2>{selectedObject.name}</h2></div><span className="object-glyph" style={{ background: selectedObject.color }} /></div><div className="object-meta"><span>{selectedObject.agency}</span><span>{selectedObject.status}</span><span>{selectedObject.launchYear ? `запуск ${selectedObject.launchYear}` : 'система планет'}</span><span className={`source-status ${selectedObject.sourceStatus ?? 'unavailable'}`}>{selectedObject.sourceStatus?.toUpperCase() ?? 'UNAVAILABLE'}</span></div><p className="mission-copy">{selectedObject.mission}</p>{selectedObject.data ? <div className="stats-grid"><div><span>До Солнца</span><strong>{km(norm(selectedObject.data))}</strong></div><div><span>До Земли</span><strong>{earth && selectedObject.id !== 'earth' ? km(distance(selectedObject.data, earth)) : '—'}</strong></div><div className="speed-stat"><span>Скорость относительно Солнца</span><strong>{speed(norm({ x: selectedObject.data.vx, y: selectedObject.data.vy, z: selectedObject.data.vz }))}</strong><small>{formatSpeedKmh(norm({ x: selectedObject.data.vx, y: selectedObject.data.vy, z: selectedObject.data.vz }))}</small></div><div><span>Покрытие</span><strong className="coverage">{selectedObject.data.coverage === 'forecast' ? 'прогноз' : selectedObject.data.coverage === 'reconstructed' ? 'реконструкция' : 'неизвестно'}</strong></div></div> : <div className="unavailable">Нет данных для выбранной эпохи. Объект не позиционируется декоративно.</div>}<div className="coordinates"><div><span>Эпоха запроса UTC</span><strong>{dateLabel(date)}</strong></div>{selectedObject.data && <><div><span>Время значения скорости UTC</span><strong>{dateLabel(new Date(selectedObject.data.requestedEpochUtc ?? date.toISOString()))}</strong></div><div><span>Система отсчёта скорости</span><strong>гелиоцентрическая, относительно Солнца</strong></div><div><span>Качество положения</span><strong>{selectedObject.data.interpolation === 'sampled' ? 'измеренная точка Horizons' : `интерполяция Hermite · оценка ±${Math.round(selectedObject.data.interpolationErrorKm ?? 0).toLocaleString('ru-RU')} км`}</strong></div>{selectedObject.data.interpolation === 'hermite' && selectedObject.data.bracketEpochTdb && <div><span>Границы ряда TDB</span><strong>{selectedObject.data.bracketEpochTdb[0]}<br />{selectedObject.data.bracketEpochTdb[1]}</strong></div>}<div><span>Вектор положения, км</span><strong>{selectedObject.data.x.toExponential(3)}<br />{selectedObject.data.y.toExponential(3)}<br />{selectedObject.data.z.toExponential(3)}</strong></div></>}</div><a className="source-link" href={selectedObject.sourceUrl} target="_blank" rel="noreferrer">Официальный источник миссии ↗</a></aside>
    </section>
    <section className="control-strip"><div className="timeline-control"><div className="timeline-label"><span className="eyebrow">Временная шкала</span><strong>{dateLabel(date)}</strong></div><input type="range" min={mode === 'deep' ? '-3650' : '-365'} max={mode === 'deep' ? '3650' : '365'} value={Math.round((date.getTime() - timelineAnchor.getTime()) / 86400000)} onChange={event => setDate(new Date(timelineAnchor.getTime() + Number(event.target.value) * 86400000))} /><div className="timeline-buttons"><button onClick={() => shiftDate(-30)}>− месяц</button><button className="play" onClick={() => setPlaying(value => !value)}>{playing ? 'Пауза' : 'Воспроизвести'}</button><button onClick={() => shiftDate(30)}>+ месяц</button><span>Шаг воспроизведения:</span>{[1, 7, 30].map(step => <button key={step} className={playbackStep === step ? 'active-step' : ''} onClick={() => setPlaybackStep(step)}>{step} д/с</button>)}</div></div><div className="mission-list"><p className="eyebrow">Интересные миссии</p><div className="mission-buttons">{catalog.filter(o => o.kind === 'spacecraft' && o.mode.includes(mode)).map(o => <button key={o.id} onClick={() => setSelected(o.id)} className={selected === o.id ? 'selected' : ''}><i style={{ background: o.color }} />{o.shortName}</button>)}</div></div></section>
    <footer><span>Данные: NASA/JPL Horizons · {response?.generatedAt ? `обновлено ${dateLabel(new Date(response.generatedAt))}` : 'ожидание ответа'}</span><span>Система координат: гелиоцентрическая эклиптика J2000 · km / km·s⁻¹</span></footer>
  </main>
}

export default App
