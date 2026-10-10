# ADR 0001: NASA JPL Horizons как основной источник

## Статус

Принято, 2026-10-10.

## Решение

Для MVP использовать NASA/JPL Horizons VECTORS с единым гелиоцентрическим центром `500@10`, эклиптикой и km/km-s. Источник, эпоха, coverage и cache status передаются до интерфейса.

## Причины

Horizons предоставляет воспроизводимые state vectors для планет и целевых аппаратов, включая обязательные Parker/Voyager/New Horizons. Это позволяет отличить реальные контрольные точки от визуальной анимации.

## Последствия

Нужны cache, timeout/backoff, bounded queries и явный unavailable. SPICE остаётся независимым следующим cross-check, а не скрытым fallback.
