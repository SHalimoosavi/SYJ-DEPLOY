# Architecture

SYJ Deploy v1.1.0-beta is a single Node.js process with an Express API, a vanilla browser dashboard, a JSON-backed metadata store and an in-process deployment queue.

```text
Browser
  │ HTTP/HTTPS
  ▼
Express + session + CSRF + RBAC
  ├── Auth / setup
  ├── Apps / deployments / logs / metrics
  ├── GitHub webhook receiver
  └── Socket.IO
        │
        ├── JSON storage ── atomic writes + backups + migrations
        ├── Deployment queue ── bounded concurrency
        │       └── Git clone → build → process/Docker runner → health check
        └── Optional HTTP/WebSocket proxy

App storage
  apps/<id>/releases/<deployment-id>
  apps/<id>/current.json

Optional Docker runner
  └── generated Dockerfile when needed
```

The process runner executes applications directly under the platform account and therefore provides **no isolation**. Docker is the stronger option when available, but Docker itself must be configured securely by the host operator.

The proxy routes `/apps/<name>/...` and, when `BASE_DOMAIN` is configured, `<name>.<BASE_DOMAIN>` traffic. Caddy configuration can be generated for TLS termination; SYJ Deploy does not implement ACME.
