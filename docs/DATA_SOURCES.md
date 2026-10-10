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

