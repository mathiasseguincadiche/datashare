#!/usr/bin/env bash
# tests-perf-audit.sh — Suite qualité DataShare
# Enchaîne : 1) Jest backend + couverture · 2) Cypress E2E frontend
#            3) Charge k6 (50 VUs) · 4) npm audit prod (back + front)
# Pas de set -e : chaque étape est indépendante, le script va jusqu'au bout.
# Usage : ./tests-perf-audit.sh                 (couleurs)
#         NO_COLOR=1 ./tests-perf-audit.sh      (capture / CI)

set -uo pipefail

# ─── Config ──────────────────────────────────────────────────────────
ROOT="/datashare"
API="http://localhost:3000"
LOG_DIR="$ROOT/logs"
LOG_FILE="$LOG_DIR/audit-$(date '+%Y-%m-%d-%H%M').log"
TOTAL=4

# Compte de test (doit exister, créé par qa-server-checks.sh ou en seed)
TEST_EMAIL="test@datashare.fr"
TEST_PWD="12345678"

mkdir -p "$LOG_DIR"

# ─── Couleurs ANSI (désactivables) ───────────────────────────────────
if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  R=$'\033[0m'; B=$'\033[1m'; D=$'\033[2m'
  G=$'\033[32m'; E=$'\033[31m'; Y=$'\033[33m'
  C=$'\033[36m'; M=$'\033[35m'
else
  R=""; B=""; D=""; G=""; E=""; Y=""; C=""; M=""
fi

# ─── Helpers présentation ────────────────────────────────────────────
hr() { printf "${D}━%.0s${R}" {1..60}; echo; }

banner() {
  local now; now=$(date '+%Y-%m-%d %H:%M:%S')
  echo "${C}╔══════════════════════════════════════════════════════════════════╗${R}"
  printf "${C}║${R}  ${B}🧪  DataShare — Suite Qualité (perf + audit)${R}                    ${C}║${R}\n"
  printf "${C}║${R}  Cible    : %-55s ${C}║${R}\n" "$API"
  printf "${C}║${R}  Étapes   : %-55s ${C}║${R}\n" "$TOTAL (Jest · Cypress · k6 · npm audit)"
  printf "${C}║${R}  Démarré  : %-55s ${C}║${R}\n" "$now"
  printf "${C}║${R}  Log      : %-55s ${C}║${R}\n" "$LOG_FILE"
  echo "${C}╚══════════════════════════════════════════════════════════════════╝${R}"
}

step() {
  local idx="$1" title="$2"
  echo
  hr
  printf "  ${B}[%d/%d]${R} ${B}${M}%s${R}\n" "$idx" "$TOTAL" "$title"
  hr
  echo
}

preflight() {
  printf "${D}🔎 Pré-vol :${R} "
  local ok=1

  # Back joignable
  if curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$API" | grep -qE '^(2|3|4)..$'; then
    printf "${G}✓ back${R} "
  else
    printf "${E}✗ back (lance: cd $ROOT/backend && npm run start:dev)${R} "; ok=0
  fi

  # Outils requis
  for cmd in node npm jq k6 curl psql; do
    if command -v "$cmd" >/dev/null 2>&1; then
      printf "${G}✓ $cmd${R} "
    else
      printf "${E}✗ $cmd${R} "; ok=0
    fi
  done
  echo

  if (( ok == 0 )); then
    echo "${E}Pré-vol échoué — corrige les ✗ ci-dessus.${R}"
    exit 2
  fi
  echo
}

# ─── Compteurs & chrono global ───────────────────────────────────────
PASS=0
FAIL=0
FAILED=()
T0=$(date +%s)

# ─── Helper résultat ─────────────────────────────────────────────────
# $1 idx  $2 label  $3 exit_code  $4 durée_secondes
result() {
  local idx="$1" label="$2" code="$3" dur="$4"
  echo
  if [[ "$code" -eq 0 ]]; then
    printf "  Verdict : ${G}✅ Validé${R} — %s ${D}(%ds)${R}\n" "$label" "$dur"
    PASS=$((PASS+1))
  else
    printf "  Verdict : ${E}❌ Échec${R}  — %s ${D}(exit %d, %ds)${R}\n" "$label" "$code" "$dur"
    FAIL=$((FAIL+1))
    FAILED+=("[$idx] $label")
  fi
}

# Tout en double : terminal + fichier log
exec > >(tee -a "$LOG_FILE") 2>&1

# ═════════════════════════════════════════════════════════════════════
banner
preflight

# ─── 1. Unitaires backend (Jest + couverture) ────────────────────────
step 1 "Unitaires backend — Jest + couverture"
T_START=$(date +%s)
( cd "$ROOT/backend" && npm run test:cov )
CODE=$?
result 1 "Jest backend (26 tests, ~74 % couverture)" $CODE $(( $(date +%s) - T_START ))

# ─── 2. E2E frontend (Cypress) ───────────────────────────────────────
step 2 "E2E frontend — Cypress (3 parcours)"
T_START=$(date +%s)
( cd "$ROOT/frontend" && npm run test:e2e )
CODE=$?
result 2 "Cypress E2E (9 tests : auth · download · upload)" $CODE $(( $(date +%s) - T_START ))

# ─── 3. Charge k6 (GET /files/:token/info, 50 VUs) ───────────────────
step 3 "Charge k6 — GET /files/:token/info sous 50 VUs"
T_START=$(date +%s)
(
  cd "$ROOT"

  # 3a. Login → JWT
  echo "  ${D}↳ Login compte de test ($TEST_EMAIL)...${R}"
  JWT=$(curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PWD\"}" \
    | jq -r .access_token)

  if [[ -z "$JWT" || "$JWT" == "null" ]]; then
    echo "  ${E}✗ Login impossible — le compte $TEST_EMAIL existe ?${R}"
    exit 10
  fi

  # 3b. Upload d'un petit fichier de test
  echo "  ${D}↳ Upload d'un fichier de test...${R}"
  echo "k6 perf sample $(date +%s)" > /tmp/k6-sample.txt
  UPLOAD_JSON=$(curl -s -X POST "$API/files/upload" \
    -H "Authorization: Bearer $JWT" \
    -F "file=@/tmp/k6-sample.txt" \
    -F "expiresInDays=1")

  FILE_TOKEN=$(echo "$UPLOAD_JSON" | jq -r .token)
  FILE_ID=$(echo "$UPLOAD_JSON"   | jq -r .id)

  if [[ -z "$FILE_TOKEN" || "$FILE_TOKEN" == "null" ]]; then
    echo "  ${E}✗ Upload k6 échoué — réponse: $UPLOAD_JSON${R}"
    exit 11
  fi

  # 3c. Lancer k6
  echo "  ${D}↳ k6 run (50 VUs)...${R}"
  FILE_TOKEN=$FILE_TOKEN k6 run scripts/k6-file-info.js
  K6_CODE=$?

  # 3d. Cleanup — supprimer le fichier de test
  echo "  ${D}↳ Cleanup fichier de test ($FILE_ID)...${R}"
  curl -s -X DELETE "$API/files/$FILE_ID" -H "Authorization: Bearer $JWT" >/dev/null

  exit $K6_CODE
)
CODE=$?
result 3 "k6 charge 50 VUs (p95 cible < 200 ms)" $CODE $(( $(date +%s) - T_START ))

# ─── 4. Audit sécurité npm (back + front, prod uniquement) ───────────
step 4 "Audit sécurité — npm audit (prod, seuil HIGH)"
T_START=$(date +%s)
(
  echo "  ${D}↳ Backend...${R}"
  cd "$ROOT/backend"  && npm audit --omit=dev --audit-level=high
  BACK_CODE=$?

  echo
  echo "  ${D}↳ Frontend...${R}"
  cd "$ROOT/frontend" && npm audit --omit=dev --audit-level=high
  FRONT_CODE=$?

  # Échec si l'un des deux remonte une vuln >= high
  exit $(( BACK_CODE | FRONT_CODE ))
)
CODE=$?
result 4 "npm audit back + front (0 vuln >= HIGH en prod)" $CODE $(( $(date +%s) - T_START ))

# ═════════════════════════════════════════════════════════════════════
# Récap final
T1=$(date +%s)
DUR=$((T1 - T0))
PCT=$(( PASS * 100 / TOTAL ))

echo
hr
printf "  ${B}📊  RÉCAP — Suite Qualité${R}\n"
hr
echo
printf "  ${G}✅ Validés${R} : %d / %d    (%d%%)\n" "$PASS" "$TOTAL" "$PCT"
printf "  ${E}❌ Échecs${R}  : %d / %d\n" "$FAIL" "$TOTAL"
printf "  ${D}⏱  Durée${R}   : %d s\n" "$DUR"
printf "  ${D}📄 Log${R}    : %s\n" "$LOG_FILE"
echo

if (( FAIL == 0 )); then
  echo "  ${G}${B}🎉 Suite qualité complète : tous les voyants au vert.${R}"
  exit 0
else
  echo "  ${E}${B}⚠️  Étapes en échec :${R}"
  for f in "${FAILED[@]}"; do
    printf "     ${E}• %s${R}\n" "$f"
  done
  exit 1
fi
