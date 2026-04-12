# Documentation Technique DataShare

## 1. Architecture de lapplication

DataShare suit une architecture web classique en trois briques :

- Frontend SPA React : interface utilisateur, navigation, formulaires, feedback visuel, appels HTTP
- Backend NestJS : authentification, regles metier, generation de liens, orchestration du stockage
- PostgreSQL + stockage local : metadonnees en base, fichiers physiques dans `backend/uploads`

Flux principal :

1. Lutilisateur se connecte et recupere un JWT.
2. Le frontend injecte automatiquement ce token sur les routes protegees.
3. Le backend valide la requete, stocke le fichier avec Multer, persiste les metadonnees et renvoie un lien public.
4. Le destinataire consulte les informations publiques puis telecharge le fichier via le token.
5. Un cron quotidien purge les fichiers expires sur le disque et en base.

## 2. Choix technologiques

- React + Vite : demarrage rapide, DX legere, ecosysteme standard pour une SPA
- TypeScript : typage front/back, reduction des erreurs de contrat
- NestJS : architecture modulaire, decorateurs, integration simple avec Swagger
- TypeORM : mapping direct des entites `users` et `files`
- PostgreSQL : relationnel adapte aux utilisateurs, fichiers, contraintes d unicite
- JWT + Passport : modele dauthentification standard et portable
- Multer : gestion du multipart et du stockage local
- Cypress + Jest : couverture des cas critiques front et backend

## 3. Modele de donnees

### Table `users`

- `id` : UUID, cle primaire
- `email` : unique
- `password` : hash bcrypt
- `created_at` : date de creation

### Table `files`

- `id` : UUID, cle primaire
- `original_name` : nom de fichier affiche a lutilisateur
- `stored_name` : nom genere pour le stockage disque
- `size` : taille en octets
- `mime_type` : type MIME
- `token` : lien public unique
- `password_hash` : hash optionnel pour proteger le telechargement
- `expires_at` : date dexpiration
- `user_id` : proprietaire du fichier
- `created_at` : date denvoi

## 4. Contrat dAPI

- `POST /auth/register` : creation dun compte
- `POST /auth/login` : authentification et emission du JWT
- `POST /files/upload` : upload authentifie via multipart/form-data
- `GET /files/:token/info` : lecture publique des metadonnees dun fichier
- `POST /files/:token/download` : telechargement public avec mot de passe optionnel
- `GET /files/history` : historique des fichiers du proprietaire
- `DELETE /files/:id` : suppression dun fichier par son proprietaire

La reference interactive est exposee via Swagger sur `/api/docs`.

## 5. Securite et gestion des acces

- Mots de passe utilisateurs et mots de passe de fichier hashes avec bcrypt
- JWT obligatoire pour toutes les routes privees
- Validation globale NestJS via `ValidationPipe`
- Fichiers executables interdits par extension
- Taille maximale de fichier controlee
- Suppression cascadee des metadonnees si un utilisateur est supprime
- Non divulgation dun fichier dun autre utilisateur lors dune tentative de suppression

## 6. Qualite, tests et maintenance

- Tests unitaires backend pour auth et files
- Test e2e backend sur le controller dauthentification
- Scenarios Cypress critiques sur inscription, connexion, upload, historique et telechargement
- Docs de suivi dediees : `TESTING.md`, `SECURITY.md`, `PERF.md`, `MAINTENANCE.md`

## 7. Processus dinstallation et dexecution

- Creation du role PostgreSQL et de la base via `scripts/setup-postgres.sh`
- Configuration via `.env` backend et frontend
- Installation avec `npm install`
- Execution avec `scripts/run-dev.sh` ou lancement manuel backend + frontend

## 8. Utilisation de lIA dans le developpement

- IA utilisee pour aider a structurer le plan, remplir le scaffold et accelerer la mise en place du prototype
- Supervision humaine sur les choix darchitecture, les ecarts de scope, la gestion des routes publiques et la documentation
- Corrections humaines integrees apres audit de coherence des documents et des exigences OpenClassrooms
