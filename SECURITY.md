# Security policy

SYJ Deploy accepts repository URLs and executes application build/start commands. Treat a deployment host as a security boundary.

## Required precautions

- Do not expose the process runner to untrusted users. It has no sandbox or filesystem isolation.
- Prefer Docker mode for workloads that are not fully trusted.
- Put the dashboard behind HTTPS. Set `TRUST_PROXY` when TLS is terminated by a trusted reverse proxy.
- Keep `.env` readable only by the service account. `MASTER_KEY` and `SESSION_SECRET` are sensitive.
- Restrict `ALLOWED_ORIGINS` when the dashboard is accessed from a separate origin.
- Use a dedicated unprivileged operating-system account.
- Do not store application secrets in Git repositories.

## Reporting

Please report security issues privately to the repository maintainer rather than publishing exploit details in an issue.
