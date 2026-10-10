# Cosmic Tracker

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

При недоступности сети приложение показывает ошибку. Зафиксированные fixtures используются только в тестах и обозначены как offline.

Примеры локальной проверки интерфейса: [Солнечная система](screenshots/solar-system-live.png) и [Дальний космос с Voyager 1](screenshots/deep-space-voyager1.png).

## Обновление и откат

VPS в этот этап не входит. Runbook для будущей публикации находится в `docs/DEPLOYMENT.md`: versioned release, healthcheck, smoke-проверка и переключение symlink с возможностью rollback.
