# Acceptance checklist

- [x] Ветка и origin проверены до реализации.
- [x] `base=/cosmic-tracker/` и API-префикс заложены в код.
- [x] Две интерактивные Canvas-карты используют одну модель данных.
- [x] Векторы и вычисляемые расстояния/скорость отображаются в карточке.
- [x] Ошибка API не маскируется фиктивной текущей позицией.
- [x] Ручная браузерная проверка после локального запуска.
- [x] Одинаковые controls zoom: +/− x1.25, текущий процент и reset 100% на обеих картах.
- [x] Проверены кнопки + (125%) и 100% (100%) через accessibility tree; Canvas поддерживает pointer pan/pinch и клавиатуру.
- [x] Playback использует загруженный ряд; Hermite interpolation и границы UTC/TDB покрыты frontend-тестами.
- [x] TDB преобразуется в UTC через `astropy.time.Time`; backend сохраняет обе эпохи и сравнивает их в UTC.
- [x] Проверены фиксированные Horizons-даты 2025-01-01, 2026-01-01 и 2027-01-01 с допуском координат 1 км и ожидаемыми UTC-эпохами.
- [x] Coverage не выводится по произвольному тексту ответа: parser оставляет `unknown`, adapter явно различает `forecast` и `reconstructed` по UTC.
- [x] API ограничивает размер запроса и отдельно тестирует simulated Horizons timeout.
- [ ] VPS/reverse proxy audit и production deployment — отдельный согласованный этап.

## Фактическая проверка

- [x] Screenshots сохранены в `screenshots/solar-system-live.png` и `screenshots/deep-space-live.png`.
- [x] Voyager 1 в ручной проверке показал 171.52 а.е. до Солнца, 171.25 а.е. до Земли и 16.92 км/с.
- [x] Live smoke получил Earth, Parker Solar Probe и Voyager 1 из Horizons; sampled trajectories возвращают несколько epoch points.
- [x] В реальном Safari подтверждены обе карты, reset/zoom 125%/100%, выбор Voyager 1 и Parker Solar Probe; в интерфейсе видны реальные cached/live статусы и координаты.
- [x] На мобильной ширине сохранены `touch-action:none`, pointer pan/pinch и кнопки управления не менее 44×44 px; интеракция pinch требует отдельного device-level прогона.

