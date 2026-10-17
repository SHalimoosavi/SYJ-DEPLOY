# Changelog

## 1.1.0-beta

- Added first-run admin setup and removed default credentials.
- Added generated persistent session and encryption secrets.
- Added CSRF protection, security headers, login backoff and origin controls.
- Added validation for repositories, branches, commands, ports and environment variables.
- Added encrypted environment storage and admin-only reveal.
- Added atomic JSON storage, rolling backups, recovery and schema versioning.
- Added deployment queue, health checks, release retention and rollback.
- Added process reconciliation and bounded restart attempts.
- Added optional Docker execution with CPU/memory limits and a non-root container user.
- Added HTTP/WebSocket proxy and Caddy configuration generation.
- Added signed GitHub webhooks and audit logging.
- Added basic RBAC and platform metrics.
- Added local Socket.IO client serving and PWA shell files.
- Added automated tests and GitHub Actions CI configuration.
