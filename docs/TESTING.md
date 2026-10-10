# Тестирование

## Локальные команды

```bash
npm --prefix frontend run check
npm --prefix frontend run test -- --run
npm --prefix frontend run build
PYTHONPATH=backend backend/.venv/bin/pytest -q
COSMIC_LIVE_HORIZONS=1 PYTHONPATH=backend backend/.venv/bin/pytest -q backend/tests/test_horizons_reference.py
```

CI выполняет frontend typecheck, Vitest, production build и backend pytest на push/pull request.

## Покрытие v0.1.3

- Backend: parser Horizons, нормы и расстояния, healthcheck, ограничения запроса, simulated Horizons failure.
- Frontend: vector math и Hermite interpolation, sampled точка, отсутствие экстраполяции, пересчёт скорости `km/s → km/h` с коэффициентом 3600 и округлением только отображаемого значения.
- Live regression: Earth на 2025-01-01, 2026-01-01 и 2027-01-01 с допуском 1 km для координат; тест отключён без `COSMIC_LIVE_HORIZONS=1`.
- Browser smoke: обе карты, source statuses, production base, кнопки `125%` и `100%`, переключение режимов, Voyager 1 и Parker Solar Probe; CSS/pointer contract проверен для мобильной ширины.
- Scientific QA: TDB→UTC conversion and explicit coverage classification use fixed unit tests plus live Horizons references.
- Speed regression: `29.84 km/s = 107424 km/h`, а также `0`, `1`, `11.2` и дробное значение с проверкой округления.

## Ручная проверка

Проверить переключение карт, выбор миссий, pan без смены объекта, wheel/keyboard zoom, reset, timeline playback, мобильную ширину и поведение при ошибке NASA. Device-level pinch на физическом смартфоне остаётся отдельной ручной проверкой. Снимки хранятся в `screenshots/`.
