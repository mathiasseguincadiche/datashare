#!/usr/bin/env bash
# qa-server-checks.sh — DataShare : preuves côté serveur, US par US
# Pour chaque contrôle : Commande / Sortie / Attendu / Verdict + explication
# Usage : ./qa-server-checks.sh                  (avec couleurs)
#         NO_COLOR=1 ./qa-server-checks.sh       (capture / CI sans ANSI)

set -u

# ─── Config ──────────────────────────────────────────────────────────
API="http://localhost:3000"
UPLOAD_DIR="/datashare/backend/uploads"
export PGPASSWORD=datashare_password
TOTAL=21

# ─── Couleurs ANSI (désactivables avec NO_COLOR=1 ou si non-tty) ─────
if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  R=$'\033[0m'; B=$'\033[1m'; D=$'\033[2m'
  G=$'\033[32m'; E=$'\033[31m'; Y=$'\033[33m'
  C=$'\033[36m'; M=$'\033[35m'
else
  R=""; B=""; D=""; G=""; E=""; Y=""; C=""; M=""
fi

# ─── Helper DB ───────────────────────────────────────────────────────
DBQ() { psql -h localhost -U datashare_user -d datashare -t -A -c "$1"; }

# ─── Helpers présentation ────────────────────────────────────────────
hr() { printf "${D}━%.0s${R}" {1..60}; echo; }

banner() {
  local now; now=$(date '+%Y-%m-%d %H:%M:%S')
  echo "${C}╔══════════════════════════════════════════════════════════════════╗${R}"
  printf "${C}║${R}  ${B}🛡️  DataShare — QA Server Checks (US par US)${R}                   ${C}║${R}\n"
  printf "${C}║${R}  Cible    : %-55s ${C}║${R}\n" "$API"
  printf "${C}║${R}  Contrôles: %-55s ${C}║${R}\n" "$TOTAL"
  printf "${C}║${R}  Démarré  : %-55s ${C}║${R}\n" "$now"
  echo "${C}╚══════════════════════════════════════════════════════════════════╝${R}"
}

section() {
  echo
  hr
  printf "  ${B}${M}%s${R}\n" "$1"
  hr
  echo
}

preflight() {
  printf "${D}🔎 Pré-vol : ping %s ...${R} " "$API"
  if curl -s -o /dev/null -w "%{http_code}" "$API" | grep -qE '^(2|3|4)..$'; then
    echo "${G}✓ Back en ligne.${R}"
  else
    echo "${E}✗ Back injoignable. Démarre-le : cd /datashare/backend && npm run start:dev${R}"
    exit 2
  fi
  echo
}

# ─── Compteurs & chrono ──────────────────────────────────────────────
OK=0; KO=0
FAILED=()
T0=$(date +%s)
i=0

# ─── Helper de contrôle (v2) ─────────────────────────────────────────
# $1 US  $2 But  $3 Commande affichée  $4 Sortie obtenue  $5 Critère humain  $6 Regex bash  $7 Explication si ✅
check() {
  local us="$1" but="$2" cmd="$3" got="$4" expected="$5" regex="$6" why="$7"
  i=$((i+1))
  local got_short; got_short=$(printf '%s' "$got" | tr '\n' ' ' | cut -c1-220)
  printf "${B}[%2d/%d]${R} ${C}%s${R}\n" "$i" "$TOTAL" "$us"
  printf "       But      : %s\n" "$but"
  printf "       Commande : ${D}%s${R}\n" "$cmd"
  printf "       Sortie   : %s\n" "$got_short"
  printf "       Attendu  : %s\n" "$expected"
  if [[ "$got" =~ $regex ]]; then
    printf "       Verdict  : ${G}✅ Validé${R}\n"
    printf "                  ${D}↳ %s${R}\n\n" "$why"
    OK=$((OK+1))
  else
    printf "       Verdict  : ${E}❌ Échec${R} — la sortie ne respecte pas le critère\n\n"
    KO=$((KO+1))
    FAILED+=("$us")
  fi
}

# ═════════════════════════════════════════════════════════════════════
banner
preflight

# ─── Setup ───────────────────────────────────────────────────────────
echo "${B}🔧 Setup${R} (clean DB + disque, register owner+intrus, login, upload)..."
DBQ "DELETE FROM files;" >/dev/null
DBQ "DELETE FROM users;" >/dev/null
rm -f "$UPLOAD_DIR"/*

OWNER="qa-owner@datashare.fr"
INTRU="qa-intrus@datashare.fr"
PWD8="12345678"

curl -s -X POST "$API/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$OWNER\",\"password\":\"$PWD8\"}" >/dev/null
curl -s -X POST "$API/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$INTRU\",\"password\":\"$PWD8\"}" >/dev/null

JWT_OWNER=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$OWNER\",\"password\":\"$PWD8\"}" | jq -r .access_token)
JWT_INTRU=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$INTRU\",\"password\":\"$PWD8\"}" | jq -r .access_token)

echo "contenu de test owner" > /tmp/qa-owner.txt
UPLOAD_JSON=$(curl -s -X POST "$API/files/upload" \
  -H "Authorization: Bearer $JWT_OWNER" \
  -F "file=@/tmp/qa-owner.txt" \
  -F "expiresInDays=1" \
  -F "password=demo123")
TOKEN=$(echo "$UPLOAD_JSON"   | jq -r .token)
FILE_ID=$(DBQ "SELECT id FROM files WHERE token='$TOKEN';")
STORED=$(DBQ "SELECT stored_name FROM files WHERE id='$FILE_ID';")
echo "${G}✓ Setup terminé${R} (TOKEN=${TOKEN:0:8}…  FILE_ID=${FILE_ID:0:8}…)"

# ═════════════════════════════════════════════════════════════════════
section "🔐  AUTHENTIFICATION & COMPTES"

# 1
GOT=$(DBQ "SELECT LEFT(password_hash,4) FROM users WHERE email='$OWNER';")
check "US03 — Création de compte" \
  "Mot de passe haché bcrypt en base (jamais en clair)" \
  "DBQ \"SELECT LEFT(password_hash,4) FROM users WHERE email='$OWNER';\"" \
  "$GOT" \
  "préfixe bcrypt \$2[aby]\$" \
  '^\$2[aby]\$' \
  "bcrypt cost ≥ 10, résiste aux attaques par dictionnaire"

# 2
GOT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$OWNER\",\"password\":\"$PWD8\"}")
check "US03 — Doublon email refusé" \
  "Contrainte UNIQUE sur users.email empêche un doublon" \
  "POST $API/auth/register avec email déjà existant" \
  "$GOT" \
  "code HTTP 409 Conflict ou 400" \
  '^(409|400)$' \
  "duplication d'identité bloquée au niveau base ET service"

# 3
GOT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"weak@test.fr\",\"password\":\"123\"}")
check "US03 — Mdp trop court refusé" \
  "Validation serveur — mdp < 8 caractères rejeté avec HTTP 400" \
  "POST $API/auth/register avec mdp '123'" \
  "$GOT" \
  "code HTTP 400 Bad Request" \
  '^400$' \
  "class-validator (DTO) bloque avant tout traitement métier"

# 4
GOT=$(echo "$JWT_OWNER" | head -c 4)
check "US02 — Login → JWT signé" \
  "Login renvoie un JWT signé HS256 (préfixe 'eyJ')" \
  "POST $API/auth/login → champ access_token" \
  "$GOT" \
  "JWT commence par 'eyJ'" \
  '^eyJ' \
  "JWT autoportant, pas de session côté serveur — scalable"

# 5
GOT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$OWNER\",\"password\":\"WRONG\"}")
check "US02 — Mdp incorrect rejeté" \
  "Login avec mauvais mdp → HTTP 401" \
  "POST $API/auth/login avec mdp 'WRONG'" \
  "$GOT" \
  "code HTTP 401" \
  '^401$' \
  "réponse générique : ne dit pas si l'email existe (anti-énumération)"

# ═════════════════════════════════════════════════════════════════════
section "📤  UPLOAD & MÉTADONNÉES"

# 6
GOT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/files/upload" \
  -F "file=@/tmp/qa-owner.txt")
check "US03 — Upload sans JWT refusé" \
  "Endpoint protégé par AuthGuard JWT" \
  "POST $API/files/upload sans header Authorization" \
  "$GOT" \
  "code HTTP 401 Unauthorized" \
  '^401$' \
  "AuthGuard('jwt') de Passport bloque toute requête anonyme"

# 7
GOT=$(DBQ "SELECT original_name FROM files WHERE id='$FILE_ID';")
check "US03 — Métadonnées persistées" \
  "Nom original conservé en base (alors que le fichier disque est renommé en UUID)" \
  "DBQ \"SELECT original_name FROM files WHERE id='$FILE_ID';\"" \
  "$GOT" \
  "exactement 'qa-owner.txt'" \
  '^qa-owner\.txt$' \
  "découplage nom logique (UX) / nom physique (sécurité)"

# 8
GOT="$STORED"
check "US03 — Fichier renommé UUID sur disque" \
  "stored_name suit le format UUID v4 + extension" \
  "DBQ \"SELECT stored_name FROM files WHERE id='$FILE_ID';\"" \
  "$GOT" \
  "UUID v4 (8-4-4-4-12) + extension (.txt)" \
  '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.' \
  "pas de path traversal possible, pas de collision de noms"

# 9
GOT=$([[ -f "$UPLOAD_DIR/$STORED" ]] && echo "PRESENT" || echo "MISSING")
check "US03 — Fichier physiquement sur disque" \
  "Le fichier référencé en base existe dans uploads/" \
  "test -f $UPLOAD_DIR/\$STORED" \
  "$GOT" \
  "valeur 'PRESENT'" \
  '^PRESENT$' \
  "cohérence base ↔ disque, prérequis pour le download"

# 10
GOT=$(DBQ "SELECT LEFT(password_hash,4) FROM files WHERE id='$FILE_ID';")
check "US09 — Mdp fichier haché bcrypt" \
  "Le mdp optionnel sur le fichier est haché comme celui du compte" \
  "DBQ \"SELECT LEFT(password_hash,4) FROM files WHERE id='$FILE_ID';\"" \
  "$GOT" \
  "préfixe bcrypt \$2[aby]\$" \
  '^\$2[aby]\$' \
  "même hygiène crypto que pour les comptes — jamais de mdp en clair"

# 11
GOT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/files/upload" \
  -H "Authorization: Bearer $JWT_OWNER" \
  -F "file=@/tmp/qa-owner.txt" \
  -F "expiresInDays=99")
check "US03 — Expiration > 7j refusée" \
  "expiresInDays > 7 rejeté par validation DTO" \
  "POST $API/files/upload avec expiresInDays=99" \
  "$GOT" \
  "code HTTP 400 Bad Request" \
  '^400$' \
  "@Max(7) (class-validator) borne la durée de rétention"

# ═════════════════════════════════════════════════════════════════════
section "🔗  PARTAGE PAR LIEN PUBLIC"

# 12
GOT="$TOKEN"
check "US04 — Token = UUID v4" \
  "Lien public = UUID v4 indevinable" \
  "DBQ \"SELECT token FROM files WHERE id='$FILE_ID';\"" \
  "$GOT" \
  "UUID v4 standard (version 4 + variant 8/9/a/b)" \
  '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' \
  "2^122 combinaisons + UNIQUE en base — pas bruteforçable"

# 13
GOT=$(curl -s -o /dev/null -w "%{http_code}" "$API/files/$TOKEN/info")
check "US04 — Endpoint /info public" \
  "Le destinataire consulte les métadonnées sans compte" \
  "GET $API/files/\$TOKEN/info (sans Authorization)" \
  "$GOT" \
  "code HTTP 200 OK" \
  '^200$' \
  "destinataire = lien seulement, pas besoin d'inscription"

# 14
GOT=$(curl -s "$API/files/$TOKEN/info" | jq -r .isPasswordProtected)
check "US09 — Flag isPasswordProtected exposé" \
  "/info signale au front qu'un mdp est requis" \
  "GET $API/files/\$TOKEN/info | jq .isPasswordProtected" \
  "$GOT" \
  "valeur 'true'" \
  '^true$' \
  "front affiche le champ mdp ; le hash, lui, ne sort jamais"

# 15
GOT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/files/$TOKEN/download" \
  -H 'Content-Type: application/json' -d '{}')
check "US09 — Download sans mdp refusé" \
  "Fichier protégé : POST /download sans mdp → 401" \
  "POST $API/files/\$TOKEN/download avec body vide" \
  "$GOT" \
  "code HTTP 401 Unauthorized" \
  '^401$' \
  "double barrière : token UUID + mot de passe bcrypt"

# 16
GOT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/files/$TOKEN/download" \
  -H 'Content-Type: application/json' -d '{"password":"demo123"}')
check "US09 — Download avec bon mdp" \
  "Mdp correct → fichier servi (HTTP 200)" \
  "POST $API/files/\$TOKEN/download avec password='demo123'" \
  "$GOT" \
  "code HTTP 200 OK" \
  '^200$' \
  "bcrypt.compare valide le mdp avant fs.createReadStream"

# 17
DBQ "UPDATE files SET expires_at = NOW() - INTERVAL '1 hour' WHERE id='$FILE_ID';" >/dev/null
GOT=$(curl -s -o /dev/null -w "%{http_code}" "$API/files/$TOKEN/info")
DBQ "UPDATE files SET expires_at = NOW() + INTERVAL '1 day' WHERE id='$FILE_ID';" >/dev/null
check "US04 — Lien expiré refusé" \
  "Si expires_at < NOW(), l'endpoint refuse l'accès" \
  "Forcer expires_at au passé puis GET /info" \
  "$GOT" \
  "code HTTP 404 ou 410" \
  '^(404|410)$' \
  "vérification temporelle dans le service, pas seulement à la purge"

# ═════════════════════════════════════════════════════════════════════
section "📜  HISTORIQUE & ISOLATION"

# 18
GOT=$(curl -s "$API/files/history" -H "Authorization: Bearer $JWT_OWNER" | jq 'length')
check "US05 — Historique owner non vide" \
  "GET /files/history retourne les fichiers de l'utilisateur connecté" \
  "GET $API/files/history (Bearer JWT_OWNER) | jq length" \
  "$GOT" \
  "nombre ≥ 1" \
  '^[1-9][0-9]*$' \
  "filtre WHERE user_id = currentUser.id côté service"

# 19
GOT=$(curl -s "$API/files/history" -H "Authorization: Bearer $JWT_INTRU" | jq 'length')
check "US05 — Isolation entre utilisateurs" \
  "Un autre user ne voit AUCUN fichier de owner" \
  "GET $API/files/history (Bearer JWT_INTRU) | jq length" \
  "$GOT" \
  "valeur '0'" \
  '^0$' \
  "isolation au niveau requête SQL — pas de masquage UI"

# ═════════════════════════════════════════════════════════════════════
section "🗑️  SUPPRESSION & PURGE"

# 20
GOT=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/files/$FILE_ID" \
  -H "Authorization: Bearer $JWT_INTRU")
check "Sécu — DELETE par non-propriétaire refusé" \
  "Intrus tente de supprimer un fichier qui n'est pas le sien → 404 (pas 403)" \
  "DELETE $API/files/\$FILE_ID (Bearer JWT_INTRU)" \
  "$GOT" \
  "code HTTP 404 Not Found" \
  '^404$' \
  "404 plutôt que 403 → on ne révèle même pas l'existence du fichier"

# 21
curl -s -X DELETE "$API/files/$FILE_ID" -H "Authorization: Bearer $JWT_OWNER" >/dev/null
DB_COUNT=$(DBQ "SELECT COUNT(*) FROM files WHERE id='$FILE_ID';")
DISK_PRESENT=$([[ -f "$UPLOAD_DIR/$STORED" ]] && echo "1" || echo "0")
GOT="db=$DB_COUNT disk=$DISK_PRESENT"
check "Bonus — Suppression nettoie base + disque" \
  "DELETE par le propriétaire supprime la ligne ET le fichier physique" \
  "DELETE puis vérif COUNT(*) en base + test -f sur disque" \
  "$GOT" \
  "exactement 'db=0 disk=0'" \
  '^db=0 disk=0$' \
  "fs.unlink + DELETE FROM files — atomicité métier respectée"

# ═════════════════════════════════════════════════════════════════════
# Récap final
T1=$(date +%s)
DUR=$((T1 - T0))
PCT=$(( OK * 100 / TOTAL ))

echo
hr
printf "  ${B}📊  RÉCAP${R}\n"
hr
echo
printf "  ${G}✅ Validés${R} : %2d / %d    (%d%%)\n" "$OK" "$TOTAL" "$PCT"
printf "  ${E}❌ Échecs${R}  : %2d / %d\n" "$KO" "$TOTAL"
printf "  ${D}⏱  Durée${R}   : %d s\n" "$DUR"
echo
if (( KO == 0 )); then
  echo "  ${G}${B}🎉 Toutes les règles métier sont validées côté serveur.${R}"
  exit 0
else
  echo "  ${E}${B}⚠️  Contrôles en échec :${R}"
  for f in "${FAILED[@]}"; do
    printf "     ${E}• %s${R}\n" "$f"
  done
  exit 1
fi
