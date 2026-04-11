#!/usr/bin/env bash
# ──────────────────────────────────────────────
# DataShare — Lancement du backend et du frontend en parallele
# Usage : cd scripts && chmod +x run-dev.sh && ./run-dev.sh
# ──────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "============================================"
echo "  DataShare — Lancement en mode developpement"
echo "============================================"
echo ""

# ── Verification des dependances ──
if [ ! -d "$ROOT_DIR/backend/node_modules" ]; then
  echo "[ERREUR] Les dependances backend ne sont pas installees."
  echo "         Lancez : cd backend && npm install"
  exit 1
fi

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "[ERREUR] Les dependances frontend ne sont pas installees."
  echo "         Lancez : cd frontend && npm install"
  exit 1
fi

# ── Fonction de nettoyage a la fermeture ──
cleanup() {
  echo ""
  echo "[INFO] Arret des processus..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  echo "[INFO] Processus arretes."
}

trap cleanup EXIT INT TERM

# ── Demarrage du backend (port 3000) ──
echo "[1/2] Demarrage du backend NestJS..."
cd "$ROOT_DIR/backend"
npm run start:dev &
BACKEND_PID=$!

# ── Petit delai pour laisser le backend demarrer ──
sleep 3

# ── Demarrage du frontend (port 5173) ──
echo "[2/2] Demarrage du frontend Vite..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  Backend  : http://localhost:3000"
echo "  Swagger  : http://localhost:3000/api/docs"
echo "  Frontend : http://localhost:5173"
echo ""
echo "  Ctrl+C pour tout arreter."
echo "============================================"
echo ""

# ── Attente de la fin des processus ──
wait
