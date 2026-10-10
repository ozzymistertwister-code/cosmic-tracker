# Acceptance checklist

- [x] Ветка и origin проверены до реализации.
- [x] `base=/cosmic-tracker/` и API-префикс заложены в код.
- [x] Две интерактивные Canvas-карты используют одну модель данных.
- [x] Векторы и вычисляемые расстояния/скорость отображаются в карточке.
- [x] Ошибка API не маскируется фиктивной текущей позицией.
- [x] Ручная браузерная проверка после локального запуска.
- [ ] VPS/reverse proxy audit и production deployment — отдельный согласованный этап.

## Фактическая проверка

- [x] Screenshots сохранены в `screenshots/solar-system-live.png` и `screenshots/deep-space-voyager1.png`.
- [x] Voyager 1 в ручной проверке показал 171.52 а.е. до Солнца, 171.25 а.е. до Земли и 16.92 км/с.
- [x] Live smoke получил Earth, Parker Solar Probe и Voyager 1 из Horizons; sampled trajectories возвращают несколько epoch points.

