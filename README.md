# DataShare

Prototype complet de transfert securise de fichiers pour le projet OpenClassrooms.

## Stack

- Frontend : React 18, TypeScript, Vite, Axios, React Router, Cypress
- Backend : NestJS, TypeScript, JWT, Passport, Multer, Swagger
- Base de donnees : PostgreSQL
- Stockage : systeme de fichiers local via `backend/uploads`
- Tests : Jest cote backend, Cypress cote frontend

## Fonctionnalites implementees

- Creation de compte : `POST /auth/register`
- Connexion JWT : `POST /auth/login`
- Upload de fichier authentifie : `POST /files/upload`
- Consultation des informations publiques dun fichier : `GET /files/:token/info`
- Telechargement public via lien : `POST /files/:token/download`
- Consultation de lhistorique des transferts : `GET /files/history`
- Suppression dun fichier : `DELETE /files/:id`
- Expiration automatique des fichiers via cron quotidien
- Protection optionnelle dun fichier par mot de passe

## Architecture

<img width="1914" height="1692" alt="image" src="https://github.com/user-attachments/assets/57dc5343-2e9a-466f-befc-ec54544f047d" />

<img width="886" height="472" alt="image" src="https://github.com/user-attachments/assets/9ebb0a64-5d9b-4e09-bf9b-ac722f87b821" />

## Installation

### 1. Pre-requis

- Node.js 20+
- npm 10+
- PostgreSQL 15+

### 2. Base de donnees

Lancer le script suivant sur la machine cible :

```bash
cd scripts
chmod +x setup-postgres.sh
./setup-postgres.sh
```

Variables prises en charge :

- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`

### 3. Configuration

Backend :

```bash
cd backend
cp .env.example .env
```

Frontend :

```bash
cd frontend
cp .env.example .env
```

### 4. Installation des dependances

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 5. Lancement

Option simple :

```bash
cd scripts
chmod +x run-dev.sh
./run-dev.sh
```

Option manuelle :

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

## Documentation API

- Swagger : [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Tests

Backend :

```bash
cd backend
npm run test
npm run test:cov
npm run test:e2e
```

Frontend :

```bash
cd frontend
npm run test:e2e
```

## Scripts utiles

- [`scripts/setup-postgres.sh`](./scripts/setup-postgres.sh) — Creation du role et de la base PostgreSQL
- [`scripts/run-dev.sh`](./scripts/run-dev.sh) — Lancement simultane du backend et du frontend
- [`scripts/k6-file-info.js`](./scripts/k6-file-info.js) — Test de performance sur lendpoint public
- [`database/init.sql`](./database/init.sql) — Schema SQL de la base de donnees

## Utilisation de lIA

- Structuration initiale du scaffold et consolidation du plan de mise en oeuvre
- Relecture humaine de la coherence architecture / securite / livrables
- Ajustements manuels sur les routes publiques pour eviter des redirections JWT parasites

## Limites du MVP

- Pas dupload anonyme
- Pas de tags
- Pas de stockage cloud
