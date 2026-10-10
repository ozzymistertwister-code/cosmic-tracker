# AGENTS.md — Cosmic Tracker

## Product and task
Build a real, scientifically correct, Russian-language **Cosmic Tracker** web application. Read `docs/ORCA_MASTER_TASK.md` completely before making changes. Do not substitute decorative animation for real planetary or spacecraft positions.

## Approved MVP
Implement **two interactive 2D modes** on a single astronomical data model and UTC timeline:
1. **Солнечная система:** Sun, 8 planets, Parker Solar Probe and other interplanetary craft.
2. **Дальний космос:** heliocentric scale roughly 0–250 AU, Voyager 1, Voyager 2 and New Horizons. Show the different departure directions; this is NOT a map of stars in light-years.
Both modes need pan/zoom, selection, source/epoch indicators, heliocentric velocity and Sun/Earth distances.

## Scientific integrity
- Priority data source: NASA JPL Horizons. ESA SPICE and NAIF kernels where useful.
- Use verified target IDs, real state vectors and documented reference frames, time scales and coverage. Preserve x,y,z,vx,vy,vz even when showing x,y in 2D.
- Compare objects at the same epoch, origin, units and axes. Derive distances and velocities from vectors; current Parker speed must never be confused with its historical record.
- Cache sampled ephemerides. No one-request-per-frame behavior. Label forecast and source freshness accurately; no undifferentiated extrapolation.
- On network or coverage failure, display unavailable state. Offline fixtures must be explicitly marked as *demo/offline*, not current live data.
- Planned launches are catalog entries, not flying spacecraft. Draw planned routes only when authoritative predicted trajectories exist, and mark them as projections.

## Security and scope
- Work ONLY in this repository. Before any action verify `pwd`, `git status`, `git remote -v`, current branch and worktree. Don't touch other projects.
- Prefer an isolated feature branch/worktree (`feature/mvp-2d`). No pushes, merges, production deployment or VPS/DNS changes without separate explicit owner approval. Local commits may be made after the user authorizes implementation.
- No `sudo`, global system installs, secret commits, destructive shell commands or paid services. Use lockfiles and pinned versions; document commands.
- The initial read-only audit was completed on 2026-10-10. Await explicit user approval before implementing; after approval, implement stages 0–2 in this worktree, with tests and report. Local development commits are allowed only when explicitly authorized. Never push, merge, deploy or modify VPS without separate approval.

## Technology and engineering
Suggested: frontend React + Vite + TypeScript + Canvas 2D; backend Python + FastAPI + httpx; SQLite cache; pytest and frontend build/typecheck/lint. Architecture must isolate ephemeris adapters, domain vectors/timeline and rendering, supporting Three.js later.

## Agent responses
Respond in **Russian**. Work sequentially, not parallel migrations/builds. At every checkpoint report: exact repository/worktree, work completed, files changed, tests actually executed, LIVE/CACHED/OFFLINE/UNAVAILABLE data status, blockers and next action. Never claim tests passed unless they were run. For the first session, **audit only**, report, and request approval for bootstrap.

## Permanent Git and documentation standard

Любое изменение кода должно сопровождаться проверкой актуальности тестов и документации. Для каждой задачи соблюдать порядок: реализация → тестирование → обновление затронутых документов → обновление `CHANGELOG.md` для значимых изменений → Conventional Commit → push в согласованную рабочую ветку → обновление PR. Версии и требования в коде, PRD, README и остальных документах не должны расходиться. Merge в `main`, VPS и production deployment требуют отдельного согласования.

## Confirmed production target (design only; no deployment authorization)
- Public URL: https://syst8m.com/cosmic-tracker/
- Vite base: `/cosmic-tracker/`; backend reverse-proxy prefix: `/cosmic-tracker/api/`. Use an environment-aware API client that works in Vite dev and production.
- Production plan includes health check, persistent ephemeris cache, versioned deploys and safe rollback, after independent READ-ONLY VPS audit and explicit approval.
- This agent runs in ORCA worktree `/Users/alexarlovsky/orca/workspaces/cosmic-tracker/flounder`; verify actual path with `pwd`. Do not assume the original checkout is current.
- Preserve existing ORCA worktree branch (currently `ozzymistertwister-code/flounder`) rather than switching or creating conflicting branches unless justified and approved.
- No log-distance projection in the default outer-space map: use a truthful linear AU scale with separate zoom and fit-to-probes; explicitly mark any non-linear projection if later offered.
