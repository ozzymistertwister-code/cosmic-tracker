# Production runbook (не выполнять в MVP)

Целевой URL: `https://syst8m.com/cosmic-tracker/`.

Перед deployment отдельным согласованием выполнить только read-only inventory VPS: действующий reverse proxy, маршруты, порты, systemd/Docker, диски, резервные копии и health endpoints. Не менять конфигурацию действующих проектов.

Для релиза использовать отдельные каталоги `releases/<version>/`, а `current` переключать только после локальной сборки, запуска FastAPI и проверки `GET /cosmic-tracker/api/health`. `/cosmic-tracker/api/` должен проксироваться в backend до SPA fallback; `/cosmic-tracker/` — в `frontend/dist`. Rollback — возврат `current` на предыдущий проверенный каталог и повторная health-проверка.

