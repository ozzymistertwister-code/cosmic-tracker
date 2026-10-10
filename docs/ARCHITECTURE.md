# Архитектура

Frontend и backend разделены. `frontend/src/domain.ts` содержит общий смысловой каталог и векторные формулы для UI, а `backend/app/domain.py` — parser и математическое ядро источника.

```text
React/Vite → relative API client → FastAPI → SQLite cache → NASA Horizons
                  ↓
             Canvas renderer
```

Production base: `/cosmic-tracker/`; API: `/cosmic-tracker/api/`. В dev Vite proxy использует `/api`.

Horizons запрашивается с `CENTER=500@10`, `EPHEM_TYPE=VECTORS`, `VEC_TABLE=2`, `REF_PLANE=ECLIPTIC`, `OUT_UNITS=KM-S`, `VEC_CORR=NONE`. Все шесть компонент состояния сохраняются. Canvas проецирует только x/y.

Кэш ключуется по target, диапазону, шагу и frame. Просроченный кэш не называется live и используется только с `offline-cache`.

## Контракт и error model

Точка эфемериды содержит `timestamp` (JDTDB), `epochTdb`, x/y/z, vx/vy/vz, `source` и `coverage`. `live` — свежий ответ Horizons; `cached` — свежий SQLite cache; `offline-cache` — stale cache при сбое; `unavailable` — позиция отсутствует и маркер не рисуется.

В production Vite собирается с `base=/cosmic-tracker/`; FastAPI запускается с `API_PREFIX=/cosmic-tracker/api`. Reverse proxy направляет API до SPA fallback, иначе healthcheck может вернуть `index.html` вместо JSON.

