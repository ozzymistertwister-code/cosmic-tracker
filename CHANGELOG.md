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

## [Unreleased]

- Планируется cross-check через SPICE, расширение каталога и дальнейшая подготовка к VPS deployment.
