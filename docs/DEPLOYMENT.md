# Production runbook (не выполнять в MVP)

Целевой URL: `https://syst8m.com/cosmic-tracker/`.

Перед deployment отдельным согласованием выполнить только read-only inventory VPS: действующий reverse proxy, маршруты, порты, systemd/Docker, диски, резервные копии и health endpoints. Не менять конфигурацию действующих проектов.

Для релиза использовать отдельные каталоги `releases/<version>/`, а `current` переключать только после локальной сборки, запуска FastAPI и проверки `GET /cosmic-tracker/api/health`. `/cosmic-tracker/api/` должен проксироваться в backend до SPA fallback; `/cosmic-tracker/` — в `frontend/dist`. Rollback — возврат `current` на предыдущий проверенный каталог и повторная health-проверка.

## Предрелизный runbook

1. Выполнить read-only inventory VPS и убедиться, что существующие маршруты/порты не конфликтуют.
2. Собрать frontend с `npm ci && npm run check && npm run test -- --run && npm run build`; установить backend из pinned requirements.
3. Создать резервную копию текущего `current` и SQLite cache, затем распаковать новый `releases/0.1.2/`.
4. Запустить backend с `API_PREFIX=/cosmic-tracker/api`, проверить JSON healthcheck и отдельный запрос эфемерид.
5. Проверить `/cosmic-tracker/`, статические assets, refresh и `/cosmic-tracker/api/health`; только после этого атомарно переключить `current`.
6. Сохранить release metadata, логи и результат smoke-проверки.

## Rollback

При ошибке healthcheck, SPA assets или API вернуть symlink `current` на предыдущий release, перезапустить только Cosmic Tracker service и снова проверить healthcheck. SQLite backup восстанавливать только если повреждён cache; cache не является единственным источником истины и может быть пересоздан через Horizons. После rollback зафиксировать причину и не менять сервисы других проектов.

## Неизменяемые ограничения

Этот runbook не даёт разрешения на VPS-доступ или изменение reverse proxy. Перед будущим запуском нужен отдельный read-only inventory действующих проектов, портов, процессов, TLS, backup и ресурсов. Нельзя ломать SPA fallback для других приложений; API `/cosmic-tracker/api/` должен иметь отдельное правило.

