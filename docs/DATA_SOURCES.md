# Источники данных

Главный источник: [NASA/JPL Horizons](https://ssd.jpl.nasa.gov/api/horizons.api), документация: [Horizons API](https://ssd-api.jpl.nasa.gov/doc/horizons.html).

Проверенные target ID MVP:

| Объект | ID |
|---|---:|
| Меркурий—Нептун | 199, 299, 399, 499, 599, 699, 799, 899 |
| Parker Solar Probe | -96 |
| Voyager 1/2 | -31 / -32 |
| New Horizons | -98 |
| JUICE | -28 |
| Europa Clipper | -159 |

Ответ API хранит `timestamp`, x/y/z, vx/vy/vz, `source`, `coverage`, generated time и cache status. Временная шкала приложения UTC; Horizons сообщает эпохи TDB в текстовом блоке.

## SPICE и ограничения

NAIF [SPICE](https://naif.jpl.nasa.gov/naif/index.html) и ESA [SPICE kernels](https://spiftp.esac.esa.int/data/SPICE/) оставлены для последующей cross-check-проверки и плотных участков. В MVP они не скачиваются автоматически и не подменяют Horizons.

Вычисления: `distance = norm(position)`, `speed = norm(velocity)`, расстояние до Земли — норма разности одновременных heliocentric position vectors. 2D Canvas показывает x/y, но z и все velocity components сохраняются. Voyager/New Horizons имеют прогнозные участки; Parker speed не следует интерпретировать как historical peak.

При перемещении по шкале приложение интерполирует соседние загруженные state vectors кубическим Hermite-полиномом, используя и position, и velocity. Экстраполяция за границы ряда запрещена: в этом случае запрашивается новый bounded range. Точная точка Horizons помечается `sampled`, восстановленная между двумя точками — `hermite`; оценка ошибки показывается отдельно и не называется измерением. Для солнечной карты используется шаг 1 день (важно для Parker Solar Probe), для дальнего космоса — 30 дней. API принимает только шаги `1/10/30/180 d`, максимум 12 объектов и 8000 дней.

UTC — эпоха управления шкалой и запроса пользователя. `epochTdb` — календарная эпоха из Horizons; она не подменяется отображаемой UTC и показывается для границ интерполяции. Перевод между шкалами не используется как основание для выдачи контрольной точки за измеренную.

