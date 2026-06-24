<div align="center">

<img src="https://img.shields.io/badge/SYJ-Deploy-7c3aed?style=for-the-badge&labelColor=0a0a0f&color=7c3aed" alt="SYJ Deploy" height="32"/>

# SYJ Deploy

### Open-Source, Self-Hosted PaaS — Deploy Any App From Any GitHub Repo

**No credit card. No vendor lock-in. No monthly bills. Your server, your rules.**

<br/>

[![Release](https://img.shields.io/github/v/release/SHalimoosavi/syj-deploy?style=flat-square&label=release&color=7c3aed)](https://github.com/SHalimoosavi/syj-deploy/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-3b82f6?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Termux Ready](https://img.shields.io/badge/termux-ready-f59e0b?style=flat-square)](https://termux.dev)
[![Made in India](https://img.shields.io/badge/made%20in-India%20🇮🇳-ef4444?style=flat-square)](https://sayanjalinexus.com)
[![SAYANJALI NEXUS](https://img.shields.io/badge/by-SAYANJALI%20NEXUS-7c3aed?style=flat-square)](https://github.com/SHalimoosavi)

<br/>

> Built and tested on **Android + Termux** · Deployed a Python AI repo in **9.1 seconds** · Zero external dependencies

<br/>

<img src="https://raw.githubusercontent.com/SHalimoosavi/syj-deploy/main/docs/preview-login.jpg" width="220" alt="SYJ Deploy Login"/> &nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/SHalimoosavi/syj-deploy/main/docs/preview-logs.jpg" width="220" alt="SYJ Deploy Live Logs"/> &nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/SHalimoosavi/syj-deploy/main/docs/preview-deployed.jpg" width="220" alt="SYJ Deploy Success"/>

*Screenshots from live test — deploying [SYJ Scholar AI](https://github.com/SHalimoosavi/SYJ-SCHOLAR-AI) on Termux, June 2026*

</div>

---

## What is SYJ Deploy?

SYJ Deploy is a **self-hosted deployment platform** — like Vercel and Railway combined — that runs entirely on your own machine. Point it at any GitHub repository, and it will clone the code, detect the stack automatically, install dependencies, build the project, and keep the process running with live log streaming to a real-time dashboard.

It runs on a $4/month VPS, an Oracle Free Tier instance, a Raspberry Pi, or — as proven in testing — **a stock Android phone running Termux with no modifications.**

There is no Docker required. No Kubernetes. No external database. No cloud account. Just Node.js and a GitHub URL.

---

## Features

```
✓ One-command install          curl | bash — works on Termux, Ubuntu, Debian, macOS
✓ Auto stack detection         Node.js · Next.js · React · Vite · Python · Static HTML
✓ Real-time log streaming      WebSocket-powered live deploy logs in the browser
✓ Git-based deployments        Clone or pull from any public GitHub repository
✓ Zero-config database         Lightweight JSON store — no Postgres, Redis, or MongoDB
✓ Per-app environment vars     Manage .env variables per app from the dashboard
✓ Full lifecycle control       Deploy · Stop · Restart · Delete — all from one UI
✓ Deployment history           Track every deploy with status, duration, and commit hash
✓ Session-based auth           Secure login system with persistent admin credentials
✓ Dark dashboard SPA           Vanilla JS — no React, no build step, instant load
✓ Open source (MIT)            Fork it, extend it, brand it, sell it
```

---

## Live Demo — What the Screenshots Show

These screenshots were taken during the first live test of SYJ Deploy running on an Android phone via Termux:

| Screenshot | What's Happening |
|---|---|
| **Login screen** | Clean auth UI loading at `localhost:3000` on Android Chrome |
| **Build in progress** | App status `building`, cloning `SHalimoosavi/SYJ-SCHOLAR-AI` from GitHub, Python stack auto-detected, `pip install` running |
| **Deployed** | `✅ Deployed successfully in 9.1s` — running on port `3165`, toast confirmation shown |

**Repo deployed in test:** [`SYJ Scholar AI`](https://github.com/SHalimoosavi/SYJ-SCHOLAR-AI) — an offline-first Python AI assistant

---

## Install

### One-liner (Linux · macOS · Termux)

```bash
curl -fsSL https://raw.githubusercontent.com/SHalimoosavi/syj-deploy/main/install.sh | bash
```

Then start the platform:

```bash
cd ~/syj-deploy && npm start
```

Open **`http://localhost:3000`** — sign in with `admin` / `admin123`

---

### Termux on Android (full steps)

```bash
# 1. Install system deps
pkg update -y && pkg install nodejs git curl -y

# 2. Install SYJ Deploy
curl -fsSL https://raw.githubusercontent.com/SHalimoosavi/syj-deploy/main/install.sh | bash

# 3. Start
cd ~/syj-deploy && npm start
```

> SYJ Deploy runs fully in Termux for development and portfolio demos. For production traffic, point it to a VPS with a public IP and optionally set up a reverse proxy with Nginx + Let's Encrypt.

---

### Manual Install

```bash
git clone https://github.com/SHalimoosavi/syj-deploy
cd syj-deploy
npm install
cp .env.example .env
# Edit .env — set your password
npm start
```

---

## Deploy Your First App

1. Open `http://localhost:3000` and sign in
2. Click **Deploy App**
3. Fill in the form:

```
App Name     →  my-api           (lowercase, hyphens only)
Repo URL     →  https://github.com/you/your-repo
Branch       →  main
Type         →  Auto-detect      (or pick your stack)
Start Cmd    →  npm start
Env Vars     →  PORT=3000
              NODE_ENV=production
```

4. Click **Deploy** — watch the live log stream as SYJ Deploy:
   - Clones the repo
   - Detects your stack
   - Installs dependencies
   - Runs your build command
   - Spawns the process on an available port

---

## Supported Stacks

| Stack | Detection Signal | Build Step | Default Start |
|---|---|---|---|
| **Node.js** | `package.json` | none (optional) | `npm start` |
| **Next.js** | `next` in deps | `npm run build` | `npm start` |
| **React (CRA)** | `react-scripts` | `npm run build` | `serve -s build` |
| **Vite** | `vite` in deps | `npm run build` | `serve -s dist` |
| **Python** | `requirements.txt` | `pip install -r requirements.txt` | `python app.py` |
| **Static HTML** | `index.html` | none | `serve -s .` |

All build and start commands can be overridden per-app from the dashboard.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Your Server                   │
│                                                 │
│  ┌──────────────┐     ┌───────────────────────┐ │
│  │  Dashboard   │────▶│   Express REST API    │ │
│  │  (Vanilla JS)│     │   + Socket.IO Server  │ │
│  └──────────────┘     └──────────┬────────────┘ │
│                                  │              │
│                         ┌────────▼────────┐     │
│                         │    Deployer     │     │
│                         │                │     │
│                         │  git clone/pull│     │
│                         │  stack detect  │     │
│                         │  npm/pip build │     │
│                         │  spawn process │     │
│                         └────────┬────────┘     │
│                                  │              │
│          ┌───────────────────────▼────────────┐ │
│          │         Running Apps               │ │
│          │  app-1 → :3101  app-2 → :3102 ...  │ │
│          └───────────────────────────────────-┘ │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  JSON Database (zero external deps)     │    │
│  │  data/db.json  ·  logs/<appId>.log      │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Configuration

Edit `syj-deploy/.env`:

```env
PORT=3000
SESSION_SECRET=replace-this-with-a-random-string
ADMIN_USER=admin
ADMIN_PASSWORD=your-secure-password
NODE_ENV=production
```

Run `node scripts/setup.js` for an interactive setup wizard.

---

## Project Structure

```
syj-deploy/
├── core/
│   ├── server.js          # Express + Socket.IO boot
│   ├── deployer.js        # Git → detect → build → spawn engine
│   ├── db.js              # JSON database layer
│   ├── logger.js          # Per-app log files
│   ├── socket.js          # Real-time WebSocket handlers
│   ├── middleware/
│   │   └── auth.js        # Session-based auth guard
│   └── routes/
│       ├── apps.js        # CRUD for apps
│       ├── auth.js        # Login / logout / session
│       ├── deploy.js      # Deploy · Stop · Restart
│       └── logs.js        # Log read / clear
├── dashboard/
│   └── public/
│       └── index.html     # Complete dashboard SPA (single file)
├── scripts/
│   └── setup.js           # Interactive first-run setup
├── install.sh             # One-liner installer
├── .env.example
├── package.json
└── README.md
```

---

## Roadmap

- [ ] **GitHub webhooks** — auto-deploy on `git push`
- [ ] **Docker support** — containerized app isolation
- [ ] **Custom domains + SSL** — Let's Encrypt via `certbot` or `acme.sh`
- [ ] **Database provisioning** — one-click Postgres / SQLite per app
- [ ] **Multi-user RBAC** — team access with role-based permissions
- [ ] **Metrics dashboard** — CPU, memory, request count per app
- [ ] **Reverse proxy layer** — built-in Nginx config generation
- [ ] **Mobile PWA** — installable dashboard for phone management

---

## Other Projects by the Author

SYJ Deploy is part of a growing open-source ecosystem built at **SAYANJALI NEXUS PRIVATE LIMITED**:

| Project | Description | Stack |
|---|---|---|
| [**SYJ Scholar AI**](https://github.com/SHalimoosavi/SYJ-SCHOLAR-AI) | Offline-first Python AI assistant for Termux · 66 files · ~6,000 lines | Python · Groq · Gemini |
| [**SYJ WebSense AI**](https://github.com/SHalimoosavi/SYJ-WebSense-AI) | CLI website Q&A chatbot — scrape any URL and ask questions | Python · BeautifulSoup · Groq |
| [**SYJ Ride**](https://github.com/SHalimoosavi/syj-ride) | Full-stack ride-hailing app targeting Portugal · real-time map tracking | Next.js 14 · Supabase · Socket.io · Leaflet |
| [**NexusShield**](https://github.com/SHalimoosavi/NexusShield) | Cyber audit CLI for SMBs · CVSS 4.0-aligned scoring | Python · Termux |
| [**SYJ NexusIntel AI**](https://github.com/SHalimoosavi/NexusIntel) | OSINT and competitive intelligence automation | Python · AI |
| **SYJ Deploy** ← you are here | Self-hosted PaaS · Vercel + Railway alternative | Node.js · Express · Socket.IO |

More at [**github.com/SHalimoosavi**](https://github.com/SHalimoosavi)

---

## About the Author

<table>
<tr>
<td width="72" valign="top">
<img src="https://github.com/SHalimoosavi.png" width="64" style="border-radius:50%" alt="Syed Ali Hasan Moosavi"/>
</td>
<td valign="top">

**Syed Ali Hasan Moosavi**
Founder & Managing Director · SAYANJALI NEXUS PRIVATE LIMITED
Hyderabad, Telangana, India 🇮🇳

Building AI products, automation systems, and open-source developer tools.

[![GitHub](https://img.shields.io/badge/GitHub-SHalimoosavi-181717?style=flat-square&logo=github)](https://github.com/SHalimoosavi)
[![Email](https://img.shields.io/badge/Email-cto@sayanjalinexus.com-7c3aed?style=flat-square&logo=gmail&logoColor=white)](mailto:cto@sayanjalinexus.com)

</td>
</tr>
</table>

---

## License

MIT © 2025–2026 [Syed Ali Hasan Moosavi](https://github.com/SHalimoosavi) · SAYANJALI NEXUS PRIVATE LIMITED

Free to use, modify, distribute, and build commercial products on top of. Attribution appreciated.

---

<div align="center">

**If SYJ Deploy saved you a Vercel bill, leave a ⭐**

*Built with intent · Shipped from Termux · Open forever*

[github.com/SHalimoosavi](https://github.com/SHalimoosavi) · [cto@sayanjalinexus.com](mailto:cto@sayanjalinexus.com)

</div>
