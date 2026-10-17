# Contributing

1. Fork or create a feature branch from `main`.
2. Keep changes small and explain security-sensitive decisions in `docs/DECISIONS.md`.
3. Run `npm test` and `npm run lint` before opening a pull request.
4. Do not commit `.env`, `data/`, `apps/`, `logs/`, credentials or generated runtime state.
5. Keep documentation platform-neutral and state limitations plainly.
6. Prefer Node built-ins over new dependencies. If a dependency is necessary, document the reason in `docs/DECISIONS.md`.
