export type Mode = 'solar' | 'deep'

export type Vector = { x: number; y: number; z: number }
export type StateVector = Vector & { vx: number; vy: number; vz: number }
export type EphemerisPoint = StateVector & {
  timestamp: string; epoch?: number; epochTdb?: string; epochUtc?: string; source: string; coverage: string;
  path?: Array<{ x: number; y: number }>;
  interpolation?: 'sampled' | 'hermite';
  requestedEpochUtc?: string;
  bracketEpochTdb?: [string, string];
  interpolationErrorKm?: number;
}

export type SpaceObject = {
  id: string; name: string; shortName: string; kind: 'planet' | 'spacecraft' | 'sun';
  targetId: string; agency: string; launchYear?: number; status: string; mission: string;
  color: string; mode: Mode[]; sourceUrl: string; data?: EphemerisPoint; error?: string; sourceStatus?: string;
}

export type EphemerisResponse = {
  generatedAt: string; epoch: string; frame: string; units: string; source: string;
  objects: Record<string, { points: EphemerisPoint[]; sourceStatus: string; error?: string }>;
}

export const AU_KM = 149_597_870.7
export const norm = (v: Vector) => Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2)
export const speedKmH = (v: StateVector) => norm({ x: v.vx, y: v.vy, z: v.vz }) * 3600
export const distance = (a: Vector, b: Vector) => norm({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })

export const catalog: SpaceObject[] = [
  { id: 'sun', name: 'Солнце', shortName: 'Солнце', kind: 'sun', targetId: '10', agency: 'NASA/JPL', status: 'звезда', mission: 'Центр гелиоцентрической системы координат', color: '#ffc96b', mode: ['solar', 'deep'], sourceUrl: 'https://ssd.jpl.nasa.gov/horizons/', },
  ...[
    ['mercury', 'Меркурий', '199', '#d98f65'], ['venus', 'Венера', '299', '#f1bd7b'], ['earth', 'Земля', '399', '#5aa9e6'], ['mars', 'Марс', '499', '#e9755b'], ['jupiter', 'Юпитер', '599', '#d5a679'], ['saturn', 'Сатурн', '699', '#e4c48c'], ['uranus', 'Уран', '799', '#82d2da'], ['neptune', 'Нептун', '899', '#658ce8'],
  ].map(([id, name, targetId, color]) => ({ id, name, shortName: name, kind: 'planet' as const, targetId, agency: 'NASA/JPL', launchYear: undefined, status: 'планета', mission: 'Гелиоцентрическая эфемерида', color, mode: ['solar', 'deep'] as Mode[], sourceUrl: 'https://ssd.jpl.nasa.gov/horizons/' })),
  { id: 'parker', name: 'Parker Solar Probe', shortName: 'Parker', kind: 'spacecraft', targetId: '-96', agency: 'NASA', launchYear: 2018, status: 'действующий', mission: 'Исследование солнечной короны и солнечного ветра', color: '#ffb347', mode: ['solar'], sourceUrl: 'https://science.nasa.gov/mission/parker-solar-probe/' },
  { id: 'voyager1', name: 'Voyager 1', shortName: 'Voyager 1', kind: 'spacecraft', targetId: '-31', agency: 'NASA', launchYear: 1977, status: 'действующий', mission: 'Межзвёздная миссия за пределами гелиосферы', color: '#81d8d0', mode: ['deep'], sourceUrl: 'https://science.nasa.gov/mission/voyager/' },
  { id: 'voyager2', name: 'Voyager 2', shortName: 'Voyager 2', kind: 'spacecraft', targetId: '-32', agency: 'NASA', launchYear: 1977, status: 'действующий', mission: 'Межзвёздная миссия и пролёты внешних планет', color: '#b29cff', mode: ['deep'], sourceUrl: 'https://science.nasa.gov/mission/voyager/' },
  { id: 'new-horizons', name: 'New Horizons', shortName: 'New Horizons', kind: 'spacecraft', targetId: '-98', agency: 'NASA', launchYear: 2006, status: 'действующий', mission: 'Разведка Плутона и объектов пояса Койпера', color: '#ff8f70', mode: ['deep'], sourceUrl: 'https://science.nasa.gov/mission/new-horizons/' },
  { id: 'juice', name: 'JUICE', shortName: 'JUICE', kind: 'spacecraft', targetId: '-28', agency: 'ESA', launchYear: 2023, status: 'действующий', mission: 'Исследование системы Юпитера', color: '#e2aa70', mode: ['solar'], sourceUrl: 'https://www.esa.int/Science_Exploration/Space_Science/Juice' },
  { id: 'europa-clipper', name: 'Europa Clipper', shortName: 'Europa Clipper', kind: 'spacecraft', targetId: '-159', agency: 'NASA', launchYear: 2024, status: 'действующий', mission: 'Исследование Европы и системы Юпитера', color: '#a4c7ff', mode: ['solar'], sourceUrl: 'https://science.nasa.gov/mission/europa-clipper/' },
]
