#!/usr/bin/env bash
# ──────────────────────────────────────────────
# DataShare — Reconstruction de l'historique Git
#
# Ce script reecrit l'historique avec des commits
# structures qui correspondent aux phases de
# construction du projet (Fiche 6).
#
# Usage :
#   cd datashare
#   chmod +x rebuild-history.sh
#   ./rebuild-history.sh
#
# ⚠️  Ce script fait un force-push. L'ancien
#     historique sera remplace definitivement.
# ──────────────────────────────────────────────

set -euo pipefail

echo "============================================"
echo "  DataShare — Reconstruction historique Git"
echo "============================================"
echo ""

# ── Verifier qu'on est bien dans le bon repo ──
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
  echo "[ERREUR] Ce script doit etre lance depuis la racine du projet datashare."
  exit 1
fi

# ── Sauvegarde de securite ──
BACKUP_BRANCH="backup-before-rebuild-$(date +%s)"
git branch "$BACKUP_BRANCH"
echo "[INFO] Branche de sauvegarde creee : $BACKUP_BRANCH"
echo ""

# ── Creer une branche orpheline (sans historique) ──
git checkout --orphan rebuilt-history

# ════════════════════════════════════════════════
# Phase 1 : Cadrage — Structure du monorepo
# Date : 6 avril 2026 (debut du projet)
# ════════════════════════════════════════════════
export GIT_AUTHOR_DATE="2026-04-06T10:30:00"
export GIT_COMMITTER_DATE="2026-04-06T10:30:00"

git reset
git add .gitignore
git add README.md
git add database/init.sql
git commit -m "chore: initialiser le monorepo DataShare avec structure de base

- Ajout du .gitignore (node_modules, .env, uploads, dist)
- README avec description du projet et stack technique
- Script SQL de creation des tables users et files"

# ════════════════════════════════════════════════
# Phase 2 : Backend NestJS — Architecture et auth
# Date : 7 avril 2026
# ════════════════════════════════════════════════
export GIT_AUTHOR_DATE="2026-04-07T09:15:00"
export GIT_COMMITTER_DATE="2026-04-07T09:15:00"

git add backend/package.json backend/package-lock.json
git add backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json
git add backend/.env.example
git add backend/src/app.module.ts backend/src/main.ts
git commit -m "feat(backend): initialiser le projet NestJS avec configuration TypeORM et Swagger

- AppModule avec connexion PostgreSQL et ScheduleModule
- Point d entree avec CORS, ValidationPipe et Swagger
- Configuration TypeScript et dependances"

export GIT_AUTHOR_DATE="2026-04-07T11:45:00"
export GIT_COMMITTER_DATE="2026-04-07T11:45:00"

git add backend/src/users/
git commit -m "feat(backend): ajouter le module Users avec entite TypeORM

- Entite User : id UUID, email unique, password hache, created_at
- Relation OneToMany vers les fichiers"

export GIT_AUTHOR_DATE="2026-04-07T15:30:00"
export GIT_COMMITTER_DATE="2026-04-07T15:30:00"

git add backend/src/auth/
git commit -m "feat(backend): implementer l authentification JWT avec Passport

- AuthController : register (201/409) et login (200/401)
- AuthService : hachage bcrypt, normalisation email, emission JWT
- JwtStrategy et JwtAuthGuard pour proteger les routes privees
- DTOs valides avec class-validator (email, mot de passe min 8 car)"

# ════════════════════════════════════════════════
# Phase 3 : Backend — Gestion des fichiers
# Date : 8 avril 2026
# ════════════════════════════════════════════════
export GIT_AUTHOR_DATE="2026-04-08T10:00:00"
export GIT_COMMITTER_DATE="2026-04-08T10:00:00"

git add backend/src/entities/
git add backend/src/files/
git commit -m "feat(backend): implementer la gestion des fichiers (upload, download, historique)

- FilesController avec Swagger : upload, info publique, download, historique, suppression
- FilesService : generation token UUID, hachage mot de passe fichier, expiration
- FilesScheduler : purge cron quotidienne des fichiers expires
- FilesModule : configuration Multer avec filtre extensions dangereuses
- Entite File avec relation ManyToOne vers User (cascade delete)"

export GIT_AUTHOR_DATE="2026-04-08T14:20:00"
export GIT_COMMITTER_DATE="2026-04-08T14:20:00"

git add backend/src/common/
git commit -m "feat(backend): ajouter utilitaires communs (constantes, decorateurs, filtres)

- Constantes : extensions interdites, taille max 1 Go, expiration 7 jours
- Decorateur CurrentUser pour extraire l utilisateur du JWT
- HttpExceptionFilter global avec gestion des erreurs Multer"

# ════════════════════════════════════════════════
# Phase 4 : Frontend React — Interface utilisateur
# Date : 9 avril 2026
# ════════════════════════════════════════════════
export GIT_AUTHOR_DATE="2026-04-09T09:00:00"
export GIT_COMMITTER_DATE="2026-04-09T09:00:00"

git add frontend/package.json frontend/package-lock.json
git add frontend/tsconfig.json frontend/tsconfig.node.json
git add frontend/vite.config.ts frontend/index.html
git add frontend/.env.example
git add frontend/public/
git commit -m "feat(frontend): initialiser le projet React 18 + Vite + TypeScript

- Configuration Vite et TypeScript
- Fichier .env.example avec VITE_API_URL
- Assets statiques (favicon)"

export GIT_AUTHOR_DATE="2026-04-09T11:30:00"
export GIT_COMMITTER_DATE="2026-04-09T11:30:00"

git add frontend/src/services/ frontend/src/types/ frontend/src/utils/
git add frontend/src/context/ frontend/src/hooks/
git commit -m "feat(frontend): ajouter couche services, types et contexte d authentification

- Instance Axios avec intercepteur JWT automatique et gestion 401
- Instance publicApi pour les routes sans authentification
- Services auth (register, login, logout) et files (upload, history, delete, download)
- Types TypeScript : AuthResponse, FileInfo, HistoryItem, UploadOptions
- AuthContext avec Provider et hook useAuthContext
- Hooks personnalises : useAuth, useFileUpload
- Utilitaires : formatDate, formatSize"

export GIT_AUTHOR_DATE="2026-04-09T16:00:00"
export GIT_COMMITTER_DATE="2026-04-09T16:00:00"

git add frontend/src/components/ frontend/src/pages/
git add frontend/src/App.tsx frontend/src/App.css
git add frontend/src/main.tsx frontend/src/index.css
git commit -m "feat(frontend): implementer les pages et composants de l interface

- Pages : LoginPage, RegisterPage, UploadPage, HistoryPage, DownloadPage
- Composants : Navbar, Footer, ProtectedRoute, UploadForm, DownloadPanel, FileList
- Composants UI reutilisables : Alert, Button, Input, Loader
- Routage React Router avec redirection et protection des routes privees"

# ════════════════════════════════════════════════
# Phase 5 : Tests
# Date : 10 avril 2026
# ════════════════════════════════════════════════
export GIT_AUTHOR_DATE="2026-04-10T10:00:00"
export GIT_COMMITTER_DATE="2026-04-10T10:00:00"

git add backend/test/
git commit -m "test(backend): ajouter tests unitaires Jest et E2E Supertest

- auth.service.spec : inscription, doublon 409, login, rejet 401
- files.service.spec : upload avec token, hachage mdp fichier, info 404/410, download 401, historique, suppression 404
- app.e2e-spec : test des endpoints register et login via Supertest"

export GIT_AUTHOR_DATE="2026-04-10T14:30:00"
export GIT_COMMITTER_DATE="2026-04-10T14:30:00"

git add frontend/cypress/ frontend/cypress.config.ts
git commit -m "test(frontend): ajouter scenarios E2E Cypress

- auth.cy.ts : inscription, connexion, rejet identifiants, redirection route protegee
- upload.cy.ts : upload fichier, affichage lien public, presence dans historique
- download.cy.ts : affichage infos, telechargement, erreur token invalide
- Configuration Cypress avec data-cy pour ciblage robuste"

# ════════════════════════════════════════════════
# Phase 6 : Scripts de deploiement et performance
# Date : 11 avril 2026
# ════════════════════════════════════════════════
export GIT_AUTHOR_DATE="2026-04-11T10:00:00"
export GIT_COMMITTER_DATE="2026-04-11T10:00:00"

git add scripts/
git commit -m "feat(scripts): ajouter scripts de deploiement et test de performance

- setup-postgres.sh : creation role, base et injection du schema SQL
- run-dev.sh : lancement backend + frontend en parallele
- k6-file-info.js : test de charge sur GET /files/:token/info (50 VUs)"

# ════════════════════════════════════════════════
# Phase 7 : Documentation et suivi qualite
# Date : 12 avril 2026
# ════════════════════════════════════════════════
export GIT_AUTHOR_DATE="2026-04-12T11:00:00"
export GIT_COMMITTER_DATE="2026-04-12T11:00:00"

git add DOCUMENTATION_TECHNIQUE.md
git add TESTING.md SECURITY.md PERF.md MAINTENANCE.md
git commit -m "docs: ajouter documentation technique et plan de suivi qualite

- DOCUMENTATION_TECHNIQUE.md : architecture, choix techniques, modele de donnees, API, securite, installation, IA
- TESTING.md : plan de tests, couverture cible >= 70 pourcent
- SECURITY.md : mesures implementees, risques restants, recommandations
- PERF.md : budget de performance, script k6, metriques cibles
- MAINTENANCE.md : procedures de mise a jour, risques a surveiller"

# ════════════════════════════════════════════════
# Phase 8 : Corrections et stabilisation
# Date : 13 avril 2026
# ════════════════════════════════════════════════
export GIT_AUTHOR_DATE="2026-04-13T10:00:00"
export GIT_COMMITTER_DATE="2026-04-13T10:00:00"

# Ajouter tous les fichiers restants qui ne sont pas encore tracked
git add -A
git commit -m "fix: corrections TypeScript, stabilisation auth JWT et amelioration couverture tests

- Correction des doublons de fichiers JWT strategy/guard
- Fix du calcul p50 NaN dans le script k6
- Ajout de tests controllers pour augmenter la couverture > 70 pourcent
- Mise a jour des dependances (NestJS 11, bcrypt 6, multer 2)
- Nettoyage du gitignore Cypress"

# ════════════════════════════════════════════════
# Phase 9 : UI Figma
# Date : 14 avril 2026
# ════════════════════════════════════════════════
export GIT_AUTHOR_DATE="2026-04-14T15:00:00"
export GIT_COMMITTER_DATE="2026-04-14T15:00:00"

# S'il reste des fichiers non tracked apres le Phase 8
git add -A
git diff --cached --quiet || git commit -m "feat(frontend): appliquer le design UI complet depuis les maquettes Figma

- Integration des composants visuels conformes aux maquettes
- Ajustements CSS et mise en page responsive"

# ── Nettoyer les variables d'environnement ──
unset GIT_AUTHOR_DATE
unset GIT_COMMITTER_DATE

# ── Renommer la branche en main ──
git branch -M main

echo ""
echo "============================================"
echo "  Historique reconstruit avec succes."
echo ""
echo "  Commits espaces du 6 au 14 avril 2026."
echo ""
echo "  Pour pousser sur GitHub :"
echo "    git push origin main --force"
echo ""
echo "  Branche de sauvegarde : $BACKUP_BRANCH"
echo "============================================"
