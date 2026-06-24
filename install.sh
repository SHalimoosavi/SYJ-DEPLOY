#!/bin/bash
# ╔══════════════════════════════════════════════════════════╗
# ║   SYJ Deploy — One-Liner Installer                      ║
# ║   SAYANJALI NEXUS PRIVATE LIMITED                       ║
# ║   github.com/SHalimoosavi/syj-deploy                    ║
# ╚══════════════════════════════════════════════════════════╝

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

REPO="https://github.com/SHalimoosavi/syj-deploy"
INSTALL_DIR="$HOME/syj-deploy"

print_banner() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${BOLD}        SYJ Deploy — Installer            ${NC}${CYAN}║${NC}"
  echo -e "${CYAN}║   SAYANJALI NEXUS PRIVATE LIMITED        ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
  echo ""
}

check_node() {
  if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠ Node.js not found. Installing...${NC}"
    if command -v pkg &> /dev/null; then
      # Termux
      pkg update -y && pkg install -y nodejs
    elif command -v apt &> /dev/null; then
      curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
      apt-get install -y nodejs
    elif command -v brew &> /dev/null; then
      brew install node
    else
      echo -e "${RED}✕ Cannot auto-install Node.js. Please install it manually.${NC}"
      exit 1
    fi
  fi
  echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
}

check_git() {
  if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠ Git not found. Installing...${NC}"
    if command -v pkg &> /dev/null; then
      pkg install -y git
    elif command -v apt &> /dev/null; then
      apt-get install -y git
    fi
  fi
  echo -e "${GREEN}✓ Git $(git --version | cut -d' ' -f3)${NC}"
}

print_banner

echo -e "${BOLD}Checking dependencies...${NC}"
check_node
check_git

echo ""
echo -e "${BOLD}Installing SYJ Deploy...${NC}"

# Clone or update
if [ -d "$INSTALL_DIR/.git" ]; then
  echo -e "${CYAN}↓ Updating existing installation...${NC}"
  cd "$INSTALL_DIR"
  git pull origin main
else
  echo -e "${CYAN}↓ Cloning SYJ Deploy...${NC}"
  git clone "$REPO" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

echo -e "${CYAN}⚙ Installing dependencies...${NC}"
npm install --legacy-peer-deps --silent

echo -e "${CYAN}⚙ Running setup...${NC}"

# Auto-create .env if not exists
if [ ! -f ".env" ]; then
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  cat > .env << EOF
PORT=3000
SESSION_SECRET=$SECRET
ADMIN_USER=admin
ADMIN_PASSWORD=admin123
NODE_ENV=production
EOF
  echo -e "${GREEN}✓ Created .env with defaults${NC}"
fi

mkdir -p apps logs data

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅  SYJ Deploy installed successfully!  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  📁 Installed to: ${CYAN}$INSTALL_DIR${NC}"
echo -e "  🌐 Dashboard:    ${CYAN}http://localhost:3000${NC}"
echo -e "  👤 Username:     ${CYAN}admin${NC}"
echo -e "  🔑 Password:     ${CYAN}admin123${NC}"
echo ""
echo -e "  ${BOLD}To start:${NC}"
echo -e "  ${YELLOW}cd $INSTALL_DIR && npm start${NC}"
echo ""
echo -e "  ${BOLD}To change password, edit:${NC}"
echo -e "  ${YELLOW}$INSTALL_DIR/.env${NC}"
echo ""
