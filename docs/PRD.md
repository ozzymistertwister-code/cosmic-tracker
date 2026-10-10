# PRD: Cosmic Tracker MVP v0.1

## Цель

Показать пользователю реальные положения планет и межпланетных аппаратов в единой гелиоцентрической модели. MVP имеет ровно два режима: Солнечная система и Дальний космос.

## Не входит в MVP

Звёздная карта в световых годах, 3D, спутники Земли, CelesTrak, прогнозирование поверх доступного диапазона и декоративные орбиты без источника.

## Критерии

- live-ответы Horizons или явный unavailable/offline-cache;
- одинаковая эпоха, центр и frame для карты и карточки;
- Canvas поддерживает выбор, zoom и pan;
- интерфейс читаем на desktop/mobile;
- frontend typecheck/build и backend pytest проходят локально.

## Acceptance scope v1.1

«Солнечная система» использует Солнце, 8 планет и Parker Solar Probe; «Дальний космос» — Voyager 1, Voyager 2 и New Horizons на линейной шкале 0–250 а.е. Оба режима используют один epoch, origin, units и state-vector model. Карточка показывает x/y/z, heliocentric speed, расстояния до Солнца/Земли, source и coverage.

В MVP не входят звёздная карта в световых годах, 3D, CelesTrak, автоматические плановые траектории и VPS deployment.

