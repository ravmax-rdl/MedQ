#!/bin/bash

# MedQ — One-Click Installation Script for Debian-based Distros
# This script sets up everything needed to run MedQ locally

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Loading spinner
spinner() {
    local pid=$1
    local delay=0.1
    local frames='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    
    while ps -p $pid > /dev/null 2>&1; do
        for frame in $(echo $frames | grep -o .); do
            echo -ne "\r${BLUE}${frame}${NC} $2"
            sleep $delay
        done
    done
    echo -ne "\r\033[2K"
}

# Header
echo -e "${CYAN}"
echo "  ███╗   ███╗███████╗██████╗  ██████╗ "
echo "  ████╗ ████║██╔════╝██╔══██╗██╔═══██╗"
echo "  ██╔████╔██║█████╗  ██║  ██║██║   ██║"
echo "  ██║╚██╔╝██║██╔══╝  ██║  ██║██║▄▄██║"
echo "  ██║ ╚═╝ ██║███████╗██████╔╝╚██████╔╝"
echo "  ╚═╝     ╚═╝╚══════╝╚═════╝  ╚══▄▄═╝ "
echo -e "${NC}"
echo -e "${YELLOW}Virtual Clinic Queue System — Installation${NC}"
echo -e "${BLUE}Debian/Ubuntu Setup${NC}"
echo ""

# Step 1: Check if running on Debian-based distro
echo -e "${YELLOW}[1/6]${NC} Detecting operating system..."
if ! grep -q "debian\|ubuntu\|devuan" /etc/os-release 2>/dev/null; then
    echo -e "${RED}✗ This script is only for Debian-based distros (Ubuntu, Debian, etc.)${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Debian-based distro detected"
echo ""

# Step 2: Install build essentials and Node.js
echo -e "${YELLOW}[2/6]${NC} Installing build essentials and Node.js..."
echo -e "${BLUE}→${NC} This may require sudo. You'll be prompted for your password."
echo ""
(sudo apt-get update > /dev/null 2>&1 && \
 sudo apt-get install -y build-essential python3 git curl ca-certificates gnupg > /dev/null 2>&1 && \
 curl -fsSL https://deb.nodesource.com/setup_22.x 2>/dev/null | sudo -E bash - > /dev/null 2>&1 && \
 sudo apt-get install -y nodejs > /dev/null 2>&1) &
spinner $! "Installing build tools and Node.js 22 LTS"
wait $!
echo -e "${GREEN}✓${NC} Build essentials and Node.js installed"
echo ""

# Step 3: Check Node.js
echo -e "${YELLOW}[3/6]${NC} Checking Node.js..."
(sleep 0.5) &
spinner $! "Verifying Node.js 18+"
wait $!

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo -e "${BLUE}→${NC} Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js 18+ required (you have v$(node -v | cut -d'v' -f2))${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node -v) detected"
echo ""

# Step 4: Install pnpm globally
echo -e "${YELLOW}[4/6]${NC} Setting up pnpm..."
(npm install -g pnpm > /dev/null 2>&1) &
spinner $! "Installing pnpm globally"
wait $!

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}✗ Failed to install pnpm${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} pnpm $(pnpm -v) installed globally"
echo ""

# Step 5: Install frontend dependencies
echo -e "${YELLOW}[5/6]${NC} Installing frontend dependencies..."
(cd "$(dirname "$0")" && pnpm install --force > /dev/null 2>&1) &
spinner $! "Installing React, Vite, and UI libraries"
wait $!
echo -e "${GREEN}✓${NC} Frontend dependencies installed"
echo ""

# Step 6: Approve and install backend dependencies
echo -e "${YELLOW}[6/6]${NC} Setting up backend..."
echo -e "${BLUE}→${NC} ${YELLOW}Next steps require user interaction:${NC}"
echo ""
echo -e "   ${BLUE}Step 1 — Approve builds:${NC}"
echo -e "   When prompted for approval, press ${YELLOW}'a'${NC} then ${YELLOW}'Enter'${NC}"
echo ""
echo -e "   ${BLUE}Step 2 — Install dependencies:${NC}"
echo -e "   When prompted for 'build tools', press ${YELLOW}'a'${NC} then ${YELLOW}'Enter'${NC}"
echo -e "   This includes better-sqlite3 compilation"
echo ""
echo -e "   ${BLUE}Follow the prompts below:${NC}"
echo ""

cd "$(dirname "$0")/server"
pnpm approve-builds
echo ""
pnpm install --force
cd - > /dev/null

echo ""
echo -e "${GREEN}✓${NC} Backend dependencies installed"
echo ""

# Step 7: Summary
echo -e "${YELLOW}[7/7]${NC} Installation complete!"
echo ""
echo -e "${GREEN}✓${NC} ${BLUE}All dependencies installed successfully${NC}"
echo ""
echo -e "${CYAN}"
echo "  ╔════════════════════════════════════════╗"
echo "  ║   Ready to start developing! 🚀       ║"
echo "  ╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${YELLOW}Quick start:${NC}"
echo ""
echo -e "  ${BLUE}Terminal 1 — Start backend:${NC}"
echo -e "    cd server"
echo -e "    pnpm dev  ${BLUE}# API runs on http://localhost:3001${NC}"
echo ""
echo -e "  ${BLUE}Terminal 2 — Start frontend:${NC}"
echo -e "    pnpm dev  ${BLUE}# App runs on http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Default Staff Credentials:${NC}"
echo -e "  Username: ${BLUE}admin${NC}"
echo -e "  Password: ${BLUE}clinic2025${NC}"
echo ""
echo -e "${YELLOW}Database:${NC}"
echo -e "  SQLite file auto-created at: ${BLUE}server/clinic.db${NC}"
echo ""
