# ADR 0003: Версионированный релиз и rollback

## Статус

Принято как план, deployment не выполнялся.

## Решение

Будущий VPS runbook использует отдельные `releases/<version>/`, атомарный `current`, healthcheck API под `/cosmic-tracker/api/health`, smoke-проверку и возврат symlink на предыдущую проверенную версию. Конфигурация существующих проектов не меняется до read-only inventory и отдельного согласования.
