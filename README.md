# SYJ Deploy

SYJ Deploy is a lightweight self-hosted Git-based deployment dashboard. It can clone a repository, detect a supported application stack, build it, run it, stream logs and expose basic deployment state from a server you control.

This repository contains the **v1.1.0-beta hardening release**. It is deliberately a small Node.js/Express application, not a general-purpose infrastructure orchestrator.

> **Security notice:** SYJ Deploy is not production-ready for untrusted users when the process runner is used or when the service is not protected by HTTPS. The process runner executes application commands with the platform account and provides no isolation. Prefer Docker mode for workloads that are not fully trusted and put the dashboard behind HTTPS.

## What works

- First-run admin setup; no built-in credentials.
- Session authentication with bcrypt password hashing, CSRF protection, login backoff and role checks.
- App creation and lifecycle actions.
- Git HTTPS/SSH repository cloning with branch validation.
- Node.js, Next.js, Vite, Python and static stack detection.
- Build/start commands with timeouts, output limits and a reduced child-process environment.
- Encrypted application environment variables using AES-256-GCM.
- Atomic JSON metadata storage with schema versioning, rolling backups and recovery.
- Bounded deployment queue with per-app exclusivity and cancellation.
- Health-gated deployments and retained release directories.
- Rollback to a retained release without replacing the active release before health succeeds.
- Process reconciliation and bounded restart attempts.
- Optional Docker execution with CPU/memory limits and a non-root container user.
- HTTP/WebSocket proxy by `/apps/<name>/...` and `<name>.<BASE_DOMAIN>` when configured.
- Caddy configuration generation for TLS termination; ACME is intentionally handled by Caddy.
- GitHub webhook signature verification and branch filtering.
- Admin/developer/viewer RBAC and an audit log for sensitive actions.
- Basic per-app memory/uptime/restart metrics where the host exposes them.
- Local Socket.IO client, manifest, icons and service-worker shell caching.

## Limitations

- JSON storage is intended for a single platform instance, not a clustered control plane.
- The deployment queue is in-process and is lost if the platform process is terminated.
- The process runner provides no isolation or resource sandbox.
- Docker availability and Docker security are host responsibilities.
- CPU metrics are not currently reported; Linux memory metrics use `/proc`, while unsupported hosts report the limitation.
- The built-in proxy is intentionally small; for public internet traffic, use a hardened reverse proxy/TLS terminator such as Caddy in front of it.
- Application-specific databases, persistent volumes and distributed scheduling are not included.

## Quick start

Requirements: Node.js 18.18+ and Git.

```bash
npm install
npm run setup
npm start
```

Open `http://localhost:3000`. The setup command creates the first administrator and persists `SESSION_SECRET` and `MASTER_KEY` in `.env` with restrictive permissions where supported.

For a completely new checkout, `npm install` is the intended installation command. Runtime state is created only after startup and is ignored by Git.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Dashboard/API listener. |
| `PROXY_PORT` | `0` | Optional separate application proxy listener. |
| `BASE_DOMAIN` | empty | Enables `<app-name>.<BASE_DOMAIN>` routing. |
| `ALLOWED_ORIGINS` | empty | Comma-separated browser origins allowed for CORS/Socket.IO. Empty means same-origin only. |
| `TRUST_PROXY` | `0` | Express trusted proxy setting. Set when HTTPS is terminated by a trusted proxy. |
| `SESSION_SECRET` | generated | Session signing secret. |
| `MASTER_KEY` | generated | Key material used to derive the AES-256-GCM environment encryption key. |
| `DATA_DIR` | `./data` | Metadata storage. |
| `APPS_DIR` | `./apps` | Release and application working directories. |
| `LOGS_DIR` | `./logs` | Deployment and audit logs. |
| `BUILD_TIMEOUT_MS` | `600000` | Maximum build/platform command duration. |
| `HEALTH_TIMEOUT_MS` | `5000` | Individual health-check timeout. |
| `HEALTH_RETRIES` | `8` | Health-check attempts after start. |
| `MAX_LOG_BYTES` | `5242880` | Per-log-file cap before rotation. |
| `MAX_RELEASES` | `5` | Retained releases per app. |
| `MAX_CONCURRENT_DEPLOYS` | `2` | Global deployment concurrency. |
| `MAX_RESTARTS` | `5` | Maximum automatic restarts during reconciliation. |
| `AUTO_RESTART_DEFAULT` | `true` | Default application restart policy. |
| `DOCKER_ENABLED` | `true` | Allow Docker mode when Docker is available. |
| `DOCKER_MEMORY` | `512m` | Docker memory limit. |
| `DOCKER_CPUS` | `1` | Docker CPU limit. |

Do not commit `.env`, `data/`, `apps/` or `logs/`.

## Process runner vs Docker runner

| | Process runner | Docker runner |
|---|---|---|
| Isolation | None | Container boundary, subject to host Docker configuration |
| Resource limits | Build/log limits; no application sandbox | CPU and memory flags |
| User | Platform account | Non-root `1000:1000` inside container |
| Host mounts | Application release directory | Application release directory, read-only |
| Recommended for untrusted code | No | Prefer this option, still audit your Docker host |

## GitHub webhooks

After creating an app, the dashboard exposes the webhook endpoint and an admin-only webhook secret. Configure GitHub to send JSON `push` events to:

```text
POST /api/deploy/webhooks/github/<app-id>
```

The signature is verified with `X-Hub-Signature-256`, and pushes for other branches are ignored.

## Caddy

When `BASE_DOMAIN` and `PROXY_PORT` are configured, an authenticated admin can retrieve a starter Caddyfile from `/api/caddyfile`. Caddy is responsible for TLS certificates and ACME. SYJ Deploy does not implement certificate issuance itself.

## Development and tests

```bash
npm test
npm run lint
```

The test suite uses Node's built-in test runner. CI also runs ESLint on supported Node versions and platforms and performs an `npm audit` report without failing the release solely on audit findings.

## Roadmap

- [x] First-run setup and security hardening
- [x] Git-based deployments and health-gated releases
- [x] Deployment queue and rollback
- [x] Optional Docker runner
- [x] Basic proxy and Caddy configuration generation
- [x] Signed GitHub webhooks
- [x] RBAC and audit logging
- [x] Basic host metrics
- [x] Local Socket.IO client and PWA shell
- [ ] Persistent application databases and volumes
- [ ] Distributed workers / multi-node scheduling
- [ ] Advanced observability and alerting

## Known issues

- Full end-to-end application deployment requires the runtime dependencies in `package.json`, Git, and optionally Docker; the repository's automated unit tests intentionally avoid heavy test dependencies.
- The current CI workflow reports `npm audit` findings rather than treating them as a release blocker; review the report before an internet-facing deployment.
- The process runner remains intentionally unsafe for untrusted application code. Use Docker and HTTPS for a stronger deployment posture.

## License

MIT. See [LICENSE](LICENSE).
