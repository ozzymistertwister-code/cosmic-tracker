# Cosmic Tracker MVP v0.1.1

Научно корректный русскоязычный атлас Солнечной системы и дальнего космоса. Положения планет и аппаратов получаются из NASA/JPL Horizons; интерфейс не подменяет эфемериды декоративной анимацией.

## Запуск на Mac

Требования: Node.js 20+, Python 3.11+ и доступ в интернет к NASA Horizons.

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

cd frontend
npm install
cd ..

# терминал 1
source backend/.venv/bin/activate
uvicorn backend.app.main:app --reload --port 8000

# терминал 2
cd frontend
npm run dev
```

Откройте http://localhost:5173/cosmic-tracker/. Vite проксирует `/api` на FastAPI.

Проверки:

```bash
cd frontend && npm run check && npm run build
cd ../backend && source .venv/bin/activate && pytest
```

## Production layout

Frontend собирается с `base=/cosmic-tracker/`. Backend поддерживает префикс через `API_PREFIX=/cosmic-tracker/api`; reverse proxy должен направлять `/cosmic-tracker/api/` в FastAPI, а `/cosmic-tracker/` — в `frontend/dist`. API нельзя отправлять в SPA fallback.

Пример запуска backend:

```bash
API_PREFIX=/cosmic-tracker/api uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Данные Horizons кэшируются в SQLite (по умолчанию `backend/data/ephemerides.sqlite3`) с TTL 6 часов. Кэш содержит источник, epoch и frame; stale-кэш явно помечается в ответе.

## Научные оговорки

Координаты — гелиоцентрические, эклиптика J2000, единицы km и km/s, временная шкала UI — UTC. На Canvas показываются x/y, но API и доменная модель сохраняют z и все компоненты скорости. Для Voyager/New Horizons Horizons использует реконструированные и прогнозные участки; это отображается как `forecast`.

При недоступности сети приложение показывает ошибку. Зафиксированные fixtures используются только в тестах и обозначены как offline. Coverage parser не выводит из текста Horizons: неизвестное значение остаётся `unknown`, а адаптер классифицирует эпоху явно относительно UTC.

Примеры локальной проверки интерфейса: [Солнечная система](screenshots/solar-system-live.png) и [Дальний космос](screenshots/deep-space-live.png).

## Обновление и откат

VPS в этот этап не входит. Runbook для будущей публикации находится в `docs/DEPLOYMENT.md`: versioned release, healthcheck, smoke-проверка и переключение symlink с возможностью rollback.

## Инженерный стандарт MVP v0.1

Cosmic Tracker разделён на React/Vite frontend, FastAPI backend, vector domain, Horizons adapter и SQLite cache. Frontend использует `base=/cosmic-tracker/`, backend — `API_PREFIX=/cosmic-tracker/api`; API должен обрабатываться reverse proxy до SPA fallback.

При запуске доступны `GET /api/health`, `GET /api/objects` и batch endpoint `/api/ephemerides`. В production те же endpoints находятся под `/cosmic-tracker/api/`. Реальные состояния имеют x/y/z, vx/vy/vz, epoch TDB и UTC, source и coverage. При недоступности Horizons приложение показывает `unavailable` или явно помеченный `offline-cache`.

Проверенный локальный результат для v0.1.1: backend pytest `7 passed, 1 skipped`, live Horizons reference test `1 passed`, frontend typecheck/build и Vitest `4 passed`, ручная browser QA обеих карт. История изменений — в [CHANGELOG.md](CHANGELOG.md).

## Навигация по документации

Публичная структура будущего раздела `/cosmic-tracker/docs/` описана в [docs/README.md](docs/README.md). Для разработки и эксплуатации используйте [руководство пользователя](docs/USER_GUIDE.md), [методы расчёта](docs/SCIENTIFIC_METHODS.md), [API](docs/API.md), [тестирование](docs/TESTING.md) и [deployment runbook](docs/DEPLOYMENT.md). ADR находятся в [docs/DECISIONS/](docs/DECISIONS/).
