# Production runbook (не выполнять в MVP)

Целевой URL: `https://syst8m.com/cosmic-tracker/`.

Перед deployment отдельным согласованием выполнить только read-only inventory VPS: действующий reverse proxy, маршруты, порты, systemd/Docker, диски, резервные копии и health endpoints. Не менять конфигурацию действующих проектов.

Для релиза использовать отдельные каталоги `releases/<version>/`, а `current` переключать только после локальной сборки, запуска FastAPI и проверки `GET /cosmic-tracker/api/health`. `/cosmic-tracker/api/` должен проксироваться в backend до SPA fallback; `/cosmic-tracker/` — в `frontend/dist`. Rollback — возврат `current` на предыдущий проверенный каталог и повторная health-проверка.

## Неизменяемые ограничения

Этот runbook не даёт разрешения на VPS-доступ или изменение reverse proxy. Перед будущим запуском нужен отдельный read-only inventory действующих проектов, портов, процессов, TLS, backup и ресурсов. Нельзя ломать SPA fallback для других приложений; API `/cosmic-tracker/api/` должен иметь отдельное правило.

