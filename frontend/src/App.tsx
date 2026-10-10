import { useEffect, useMemo, useState } from 'react'
import { loadEphemerides } from './api'
import { AU_KM, catalog, distance, norm, type EphemerisResponse, type Mode, type SpaceObject } from './domain'
import { MapCanvas } from './MapCanvas'
import './styles.css'

const dateLabel = (value: Date) => new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(value)
const km = (value: number) => value > AU_KM * .01 ? `${(value / AU_KM).toFixed(2)} а.е.` : `${Math.round(value).toLocaleString('ru-RU')} км`
const speed = (value: number) => `${value.toFixed(2)} км/с`

function App() {
  const [mode, setMode] = useState<Mode>('solar')
  const [date, setDate] = useState(() => new Date())
  const [selected, setSelected] = useState('earth')
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<EphemerisResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    const ids = mode === 'solar'
      ? catalog.filter(object => object.mode.includes('solar')).map(object => object.id)
      : ['sun', 'earth', 'jupiter', 'saturn', 'uranus', 'neptune', 'voyager1', 'voyager2', 'new-horizons']
    loadEphemerides(ids, date, mode).then(data => { if (!cancelled) setResponse(data) }).catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось загрузить эфемериды') }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [date, mode])
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setDate(value => new Date(value.getTime() + 86400000)), 1000); return () => window.clearInterval(timer) }, [playing])

  const objects = useMemo<SpaceObject[]>(() => catalog.map(object => {
    const item = response?.objects[object.id]; const points = item?.points ?? []
    const closest = points.length ? points.reduce((best, point) => {
      const pointTime = point.epochTdb ? new Date(point.epochTdb).getTime() : Number.NaN
      const bestTime = best.epochTdb ? new Date(best.epochTdb).getTime() : Number.NaN
      if (!Number.isFinite(pointTime) || !Number.isFinite(bestTime)) return best
      return Math.abs(pointTime - date.getTime()) < Math.abs(bestTime - date.getTime()) ? point : best
    }, points[0]) : undefined
    return { ...object, data: closest ? { ...closest, path: points.map(p => ({ x: p.x, y: p.y })) } : undefined, error: item?.error }
  }), [response, date])
  const visible = objects.filter(o => o.mode.includes(mode) && (o.name.toLowerCase().includes(query.toLowerCase()) || o.shortName.toLowerCase().includes(query.toLowerCase())))
  const selectedObject = objects.find(o => o.id === selected) ?? visible[0] ?? objects[0]
  const earth = objects.find(o => o.id === 'earth')?.data
  const dataStatus = response ? (Object.values(response.objects).some(v => v.sourceStatus === 'live') ? 'LIVE' : 'UNAVAILABLE') : '—'

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
      <aside className="inspector"><div className="inspector-head"><div><p className="eyebrow">Объект наблюдения</p><h2>{selectedObject.name}</h2></div><span className="object-glyph" style={{ background: selectedObject.color }} /></div><div className="object-meta"><span>{selectedObject.agency}</span><span>{selectedObject.status}</span><span>{selectedObject.launchYear ? `запуск ${selectedObject.launchYear}` : 'система планет'}</span></div><p className="mission-copy">{selectedObject.mission}</p>{selectedObject.data ? <div className="stats-grid"><div><span>До Солнца</span><strong>{km(norm(selectedObject.data))}</strong></div><div><span>До Земли</span><strong>{earth && selectedObject.id !== 'earth' ? km(distance(selectedObject.data, earth)) : '—'}</strong></div><div><span>Скорость</span><strong>{speed(norm({ x: selectedObject.data.vx, y: selectedObject.data.vy, z: selectedObject.data.vz }))}</strong></div><div><span>Покрытие</span><strong className="coverage">{selectedObject.data.coverage === 'forecast' ? 'прогноз' : 'реконструкция'}</strong></div></div> : <div className="unavailable">Нет данных для выбранной эпохи. Объект не позиционируется декоративно.</div>}<div className="coordinates"><div><span>Эпоха UTC</span><strong>{dateLabel(date)}</strong></div>{selectedObject.data && <div><span>Вектор положения, км</span><strong>{selectedObject.data.x.toExponential(3)}<br />{selectedObject.data.y.toExponential(3)}<br />{selectedObject.data.z.toExponential(3)}</strong></div>}</div><a className="source-link" href={selectedObject.sourceUrl} target="_blank" rel="noreferrer">Официальный источник миссии ↗</a></aside>
    </section>
    <section className="control-strip"><div className="timeline-control"><div className="timeline-label"><span className="eyebrow">Временная шкала</span><strong>{dateLabel(date)}</strong></div><input type="range" min="-365" max="365" value={Math.round((date.getTime() - Date.now()) / 86400000)} onChange={event => setDate(new Date(Date.now() + Number(event.target.value) * 86400000))} /><div className="timeline-buttons"><button onClick={() => shiftDate(-30)}>− месяц</button><button className="play" onClick={() => setPlaying(value => !value)}>{playing ? 'Пауза' : 'Воспроизвести'}</button><button onClick={() => shiftDate(30)}>+ месяц</button><span>UTC · шаги меняют дату, а не рисуют анимацию</span></div></div><div className="mission-list"><p className="eyebrow">Интересные миссии</p><div className="mission-buttons">{catalog.filter(o => o.kind === 'spacecraft' && o.mode.includes(mode)).map(o => <button key={o.id} onClick={() => setSelected(o.id)} className={selected === o.id ? 'selected' : ''}><i style={{ background: o.color }} />{o.shortName}</button>)}</div></div></section>
    <footer><span>Данные: NASA/JPL Horizons · {response?.generatedAt ? `обновлено ${dateLabel(new Date(response.generatedAt))}` : 'ожидание ответа'}</span><span>Система координат: гелиоцентрическая эклиптика J2000 · km / km·s⁻¹</span></footer>
  </main>
}

export default App
