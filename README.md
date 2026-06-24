# SYJ Deploy

> **Open-source, self-hosted PaaS — deploy frontend & backend apps from any GitHub repo.**
> Built by [SAYANJALI NEXUS PRIVATE LIMITED](https://github.com/SHalimoosavi) · Hyderabad, India 🇮🇳

[![License: MIT](https://img.shields.io/badge/License-MIT-7c3aed.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-1.0.0--beta-blue)](package.json)
[![Termux](https://img.shields.io/badge/Termux-Ready-orange)](https://termux.dev)

---

## What is SYJ Deploy?

SYJ Deploy is a self-hosted deployment platform — like Vercel + Railway — that you run on **your own server or VPS**. Pull any GitHub repo, auto-detect the stack, build it, and serve it live. All from a beautiful dark dashboard with real-time logs.

**Runs on:** Linux VPS · Oracle Free Tier · Hetzner · Raspberry Pi · Any Node.js environment

---

## Features

- **One-command install** via `curl` — works on Termux, Ubuntu, Debian
- **Auto-detects stack** — Node.js, Next.js, React, Vite, Python, Static HTML
- **Live log streaming** via WebSocket — watch deploys happen in real time
- **Git-based deploys** — connect any public GitHub repo and deploy on demand
- **Zero external database** — lightweight JSON store, no Postgres/Redis required
- **Environment variables** — per-app `.env` management from the dashboard
- **Multi-app dashboard** — manage all your services from one dark UI
- **Deploy history** — track every deployment with status, duration, commit hash
- **Restart / Stop / Delete** — full process lifecycle management
- **Open source** — MIT licensed, fork and extend freely

---

## One-Liner Install

```bash
curl -fsSL https://raw.githubusercontent.com/SHalimoosavi/syj-deploy/main/install.sh | bash
```

Then start it:

```bash
cd ~/syj-deploy && npm start
```

Open **http://localhost:3000** — login with `admin / admin123`.

---

## Install on Termux (Android)

```bash
pkg update && pkg install nodejs git curl -y
curl -fsSL https://raw.githubusercontent.com/SHalimoosavi/syj-deploy/main/install.sh | bash
cd ~/syj-deploy && npm start
```

> SYJ Deploy runs fully in Termux for **development and testing**. For production, point it to a VPS with a public IP.

---

## Manual Install

```bash
git clone https://github.com/SHalimoosavi/syj-deploy
cd syj-deploy
npm install
cp .env.example .env
# Edit .env to set your password
npm start
```

---

## Deploying Your First App

1. Open **http://localhost:3000**
2. Sign in with your admin credentials
3. Click **Deploy App**
4. Enter:
   - App name (e.g. `my-api`)
   - GitHub repo URL
   - Branch, build command, start command
   - Environment variables
5. Click **Deploy** — watch the live logs

SYJ Deploy will clone the repo, detect the stack, install dependencies, build, and start the process automatically.

---

## Supported Stacks

| Stack | Detection | Build | Start |
|-------|-----------|-------|-------|
| Node.js | `package.json` | optional | `npm start` |
| Next.js | `next` in deps | `npm run build` | `npm start` |
| React (CRA) | `react-scripts` | `npm run build` | `serve -s build` |
| Vite | `vite` in deps | `npm run build` | `serve -s dist` |
| Python | `requirements.txt` | `pip install` | `python app.py` |
| Static HTML | `index.html` | — | `serve -s .` |

---

## Architecture

```
GitHub Repo
    │
    ▼
SYJ Deploy (Node.js)
├── Express API  → REST endpoints
├── Socket.IO    → Real-time logs
├── Deployer     → Git pull → detect → build → spawn
├── JSON DB      → Zero-config data store
└── Dashboard    → Vanilla JS SPA
    │
    ▼
Running App (any port)
```

---

## Roadmap

- [ ] GitHub webhooks (auto-deploy on push)
- [ ] Docker support
- [ ] Custom domains + SSL (Let's Encrypt)
- [ ] PostgreSQL/MySQL database provisioning
- [ ] Multi-user with role-based access
- [ ] Metrics (CPU, memory, request count)
- [ ] Mobile-responsive dashboard improvements

---

## Configuration

Edit `~/.syj-deploy/.env` or `syj-deploy/.env`:

```env
PORT=3000
SESSION_SECRET=your-random-secret
ADMIN_USER=admin
ADMIN_PASSWORD=your-password
```

---

## License

MIT © [Syed Ali Hasan Moosavi](https://github.com/SHalimoosavi) · SAYANJALI NEXUS PRIVATE LIMITED

---

<p align="center">Built with ⚡ in Hyderabad, India</p>
