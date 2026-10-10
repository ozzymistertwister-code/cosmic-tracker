# Changelog

Все заметные изменения Cosmic Tracker фиксируются здесь.

## [0.1.0] — 2026-10-10

- Создан React + TypeScript + Vite frontend.
- Создан FastAPI backend с SQLite cache и healthcheck.
- Добавлен parser реальных NASA/JPL Horizons vectors, включая sampled points и epoch TDB.
- Добавлены две 2D-карты: «Солнечная система» и «Дальний космос».
- Добавлены Parker Solar Probe, Voyager 1/2, New Horizons, JUICE и Europa Clipper.
- Добавлены pan, zoom, выбор миссии, UTC timeline, playback, скорости и расстояния.
- Добавлены production prefixes `/cosmic-tracker/` и `/cosmic-tracker/api/`.
- Добавлены тесты, CI, screenshots и документация.

## [0.1.1] — 2026-10-10

- Стабилизирован Canvas: state-driven render без synthetic resize, Retina bitmap, zoom/pan/pinch, клавиатура и кнопки масштаба 100%.
- Добавлена Hermite-интерполяция state vectors, явные sampled/hermite метаданные и оценка ошибки; временная шкала больше не запрашивает NASA на каждый кадр.
- Добавлены bounded API-запросы, статусы по объектам и тесты NASA timeout/ограничений.
- Обновлены acceptance screenshots после браузерной smoke-проверки обеих карт и проверены zoom 125%/100%.
- Добавлен опциональный live-регрессионный тест Earth на трёх фиксированных эпохах Horizons.
- Исправлено преобразование TDB → UTC через `astropy.time.Time`, добавлено поле `epochUtc` и версионирование кэша.
- Coverage больше не определяется по слову `pred`: parser возвращает `unknown`, adapter применяет явную UTC-классификацию; добавлены фиксированные тесты времени и статусов.
## [Unreleased]

- Планируется cross-check через SPICE, расширение каталога и дальнейшая подготовка к VPS deployment.
