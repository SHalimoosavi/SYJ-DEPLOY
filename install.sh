#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)";cd "$ROOT"
command -v node >/dev/null 2>&1||{ echo 'Node.js 18.18+ is required.';exit 1; };command -v git >/dev/null 2>&1||{ echo 'Git is required.';exit 1; }
node -e "const v=process.versions.node.split('.').map(Number);if(v[0]<18||(v[0]===18&&v[1]<18))process.exit(1)"||{ echo 'Node.js 18.18+ is required.';exit 1; }
npm install
if [ ! -f .env ];then touch .env;chmod 600 .env 2>/dev/null||true;fi
echo 'Install complete. If no administrator exists, run: npm run setup';echo 'Start with: npm start'
