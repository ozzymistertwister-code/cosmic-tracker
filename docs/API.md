# API Cosmic Tracker v0.1.1

В разработке endpoint доступен под `/api/`; в production reverse proxy публикует его под `/cosmic-tracker/api/`. Все ответы JSON. CORS разрешён только для localhost frontend.

## `GET /health`

Ответ `200`:

```json
{"status":"ok","service":"cosmic-tracker-api","source":"NASA/JPL Horizons","cache":"..."}
```

## `GET /objects`

Возвращает каталог API-идентификаторов:

```json
{"objects":[{"id":"earth","targetId":"399"}]}
```

## `GET /ephemerides`

Параметры:

| Параметр | Обязателен | Формат | Ограничение |
|---|---:|---|---|
| `ids` | да | `earth,parker` | 1–12 объектов |
| `start` | нет | ISO 8601 | UTC/offset |
| `end` | нет | ISO 8601 | позже `start` |
| `step` | нет | `1 d`, `10 d`, `30 d`, `180 d` | только эти значения |

Максимальный диапазон — 8000 дней. Неизвестный объект получает `sourceStatus=unavailable`; некорректные ограничения запроса возвращают HTTP 400.

Ответ:

```json
{
  "generatedAt":"2026-10-10T00:00:00+00:00",
  "epoch":"2026-10-10T00:00:00+00:00",
  "frame":"Ecliptic J2000 heliocentric",
  "units":"km, km/s",
  "source":"NASA/JPL Horizons",
  "objects": {
    "earth": {
      "sourceStatus":"live",
      "points":[{"timestamp":"JDTDB","epochTdb":"2026-10-10T00:00:00.000","epochUtc":"2026-10-09T23:58:50.818Z","x":0,"y":0,"z":0,"vx":0,"vy":0,"vz":0,"source":"NASA/JPL Horizons","coverage":"unknown"}]
    }
  }
}
```

`sourceStatus`: `live` — свежий ответ; `cached` — свежий SQLite cache; `offline-cache` — устаревший cache при ошибке NASA; `unavailable` — точки нет. `coverage` описывает реконструированный или прогнозный участок и не заменяет статус источника.

## Ошибки и кэш

Таймауты/HTTP-ошибки Horizons не ломают batch целиком. У объекта сохраняется `error`, а backend использует stale cache только с `offline-cache`. Ключ SQLite учитывает target, диапазон, шаг, parser version и frame; TTL — 6 часов.
