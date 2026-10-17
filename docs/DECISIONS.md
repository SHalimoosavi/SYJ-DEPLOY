# Engineering decisions

## v1.1.0-beta

- Keep Node.js, Express and the vanilla SPA; the release hardens the existing MVP instead of replacing it.
- Use Node built-ins for crypto, process control, storage, HTTP proxying and metrics; no new runtime dependencies were added.
- Keep JSON storage for the beta, but put it behind an interface with atomic writes, backups, recovery and schema migration.
- Use an in-house login limiter and security headers instead of adding middleware dependencies.
- Use AES-256-GCM with a key derived from `MASTER_KEY`; encrypted environment values are never returned by normal app APIs.
- Use a session CSRF token for browser state-changing requests; GitHub webhooks are exempt because they use HMAC signatures.
- Use an explicit shell only for user-defined build/start commands; platform-controlled Git and Docker commands use argument arrays. User commands have timeouts, output caps and a minimal environment.
- Prefer Docker when available, but retain the existing process runner as a fallback. The process runner provides no isolation.
- Use a lightweight in-process deployment queue for the beta; it is intentionally not a distributed job system.
- Use a file-backed `current.json` release pointer instead of filesystem symlinks so the release mechanism works across supported operating systems.
- Serve the Socket.IO client from the installed package rather than a CDN.
- Use Caddy configuration generation rather than implementing ACME/TLS inside the platform.
- Keep platform-specific metrics honest: Linux `/proc` provides memory data; unsupported systems report that metrics are unavailable.
