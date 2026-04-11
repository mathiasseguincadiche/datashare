#!/usr/bin/env bash
# ──────────────────────────────────────────────
# DataShare — Initialisation de la base PostgreSQL
# Usage : cd scripts && chmod +x setup-postgres.sh && ./setup-postgres.sh
# ──────────────────────────────────────────────
# Les tables (users, files) sont créées automatiquement par TypeORM
# au premier démarrage du backend (synchronize: true en développement).
# Ce script ne crée que le rôle, la base et l'extension pgcrypto.
# ──────────────────────────────────────────────

set -euo pipefail

# ── Variables (modifiables via environnement) ──
DB_NAME="${DATABASE_NAME:-datashare}"
DB_USER="${DATABASE_USER:-datashare_user}"
DB_PASS="${DATABASE_PASSWORD:-datashare_password}"

echo "============================================"
echo "  DataShare — Setup PostgreSQL"
echo "============================================"
echo ""
echo "  Base    : $DB_NAME"
echo "  Role    : $DB_USER"
echo ""

# ── Creation du role PostgreSQL ──
echo "[1/4] Creation du role PostgreSQL..."
sudo -u postgres psql -tc \
  "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" \
  | grep -q 1 \
  && echo "       Role '$DB_USER' existe deja." \
  || {
    sudo -u postgres psql -c \
      "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS';"
    echo "       Role '$DB_USER' cree."
  }

# ── Creation de la base de donnees ──
echo "[2/4] Creation de la base de donnees..."
sudo -u postgres psql -tc \
  "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" \
  | grep -q 1 \
  && echo "       Base '$DB_NAME' existe deja." \
  || {
    sudo -u postgres psql -c \
      "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    echo "       Base '$DB_NAME' creee."
  }

# ── Droits sur la base ──
echo "[3/4] Attribution des droits..."
sudo -u postgres psql -c \
  "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c \
  "GRANT ALL ON SCHEMA public TO $DB_USER;"

# ── Extension pgcrypto ──
echo "[4/4] Activation de pgcrypto..."
sudo -u postgres psql -d "$DB_NAME" -c \
  "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

echo ""
echo "============================================"
echo "  Setup termine avec succes."
echo ""
echo "  Identifiants de connexion :"
echo "    Host     : localhost"
echo "    Port     : 5432"
echo "    Base     : $DB_NAME"
echo "    User     : $DB_USER"
echo "    Password : $DB_PASS"
echo ""
echo "  Les tables seront creees automatiquement"
echo "  par TypeORM au demarrage du backend."
echo ""
echo "  Verification rapide :"
echo "    sudo -u postgres psql -d $DB_NAME -c '\dt'"
echo "============================================"
