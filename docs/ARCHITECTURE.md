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

