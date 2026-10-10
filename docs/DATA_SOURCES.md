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

Ответ API хранит `timestamp`, `epochTdb`, преобразованную `epochUtc`, x/y/z, vx/vy/vz, `source`, `coverage`, generated time и cache status. Временная шкала приложения UTC; исходная эпоха Horizons остаётся TDB.

## SPICE и ограничения

NAIF [SPICE](https://naif.jpl.nasa.gov/naif/index.html) и ESA [SPICE kernels](https://spiftp.esac.esa.int/data/SPICE/) оставлены для последующей cross-check-проверки и плотных участков. В MVP они не скачиваются автоматически и не подменяют Horizons.

Вычисления: `distance = norm(position)`, `speed = norm(velocity)`, расстояние до Земли — норма разности одновременных heliocentric position vectors. 2D Canvas показывает x/y, но z и все velocity components сохраняются. Voyager/New Horizons имеют прогнозные участки; Parker speed не следует интерпретировать как historical peak.

При перемещении по шкале приложение интерполирует соседние загруженные state vectors кубическим Hermite-полиномом, используя и position, и velocity. Экстраполяция за границы ряда запрещена: в этом случае запрашивается новый bounded range. Точная точка Horizons помечается `sampled`, восстановленная между двумя точками — `hermite`; оценка ошибки показывается отдельно и не называется измерением. Для солнечной карты используется шаг 1 день (важно для Parker Solar Probe), для дальнего космоса — 30 дней. API принимает только шаги `1/10/30/180 d`, максимум 12 объектов и 8000 дней.

UTC — эпоха управления шкалой и запроса пользователя. `epochTdb` — исходная календарная эпоха Horizons, `epochUtc` — результат проверенного TDB→UTC преобразования. Сравнения временных точек выполняются по `epochUtc`; TDB показывается отдельно для трассируемости. Coverage не определяется поиском слова или прошлым/будущим временем: без явного metadata Horizons остаётся `unknown`.

Для регрессионной проверки записаны контрольные heliocentric-векторы Земли на 2025-01-01, 2026-01-01 и 2027-01-01. Интеграционный тест `backend/tests/test_horizons_reference.py` запускается с `COSMIC_LIVE_HORIZONS=1`; без этого флага он пропускается, чтобы CI не зависел от внешнего сервиса.

## Каталог приоритетных миссий

Эта таблица описывает миссии и события, а не заменяет текущие эфемериды. Даты и статус проверены 2026-10-10; плановые даты помечены как плановые.

| Миссия | Агентство / запуск | Маршрут и задачи | Ключевые события | Horizons / источник |
|---|---|---|---|---|
| Parker Solar Probe | NASA; 12.08.2018 | Сильно вытянутая гелиоцентрическая орбита, повторные сближения с Солнцем; корона, солнечный ветер и ускорение частиц | запуск; серия венерианских гравитационных манёвров; ближайшие пролёты у Солнца | target `-96`; [NASA Parker](https://science.nasa.gov/mission/parker-solar-probe/) |
| Voyager 1 | NASA/JPL; 05.09.1977 | Jupiter → Saturn/Titan → траектория севернее эклиптики; межзвёздная среда | Jupiter 05.03.1979; Saturn 12.11.1980; межзвёздное пространство — август 2012 | target `-31`; [NASA Voyager 1](https://science.nasa.gov/mission/voyager/voyager-1/) |
| Voyager 2 | NASA/JPL; 20.08.1977 | Jupiter → Saturn → Uranus → Neptune; далее ниже эклиптики в межзвёздную среду | Jupiter 09.07.1979; Uranus 24.01.1986; Neptune 25.08.1989; межзвёздное пространство — ноябрь 2018 | target `-32`; [NASA Voyager overview](https://science.nasa.gov/mission/voyager/mission-overview/) |
| New Horizons | NASA/APL; 19.01.2006 | Jupiter gravity assist → Pluto → пояс Койпера; пролётные исследования | Jupiter 28.02.2007; Pluto 14.07.2015; Arrokoth 01.01.2019 | target `-98`; [NASA New Horizons](https://science.nasa.gov/mission/new-horizons/) |
| JUICE | ESA-led; 14.04.2023 | Earth–Moon/Earth и Venus gravity assists → Jupiter; Ganymede, Europa, Callisto и магнитосфера Jupiter | запуск; lunar–Earth assist 2024; Venus assist 2025; Jupiter arrival планируется на июль 2031 | target `-28`; [ESA JUICE factsheet](https://www.esa.int/Science_Exploration/Space_Science/Juice/Juice_factsheet) |
| Europa Clipper | NASA/JPL/APL; 14.10.2024 | Mars/Earth gravity assists → Jupiter; орбита Jupiter и близкие пролёты Europa | Mars flyby планировался на 2025; Earth assist — декабрь 2026; Jupiter — апрель 2030 (план) | target `-159`; [NASA Europa Clipper](https://science.nasa.gov/mission/europa-clipper/) |

Для маршрутов и плановых событий указаны официальные mission pages; фактическое положение на дату берётся только из Horizons. Если Horizons не вернул объект, UI показывает `UNAVAILABLE`, а не маршрут из этой таблицы. Научные детали запуска и событий могут обновляться агентствами; перед публикацией docs нужна повторная проверка первоисточников.

