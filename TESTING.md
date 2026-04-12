# TESTING.md

## Objectif

Verifier le MVP DataShare sur les flux critiques :

- authentification
- upload
- telechargement
- historique
- suppression
- expiration automatique

## Plan de tests

| Fonctionnalite | Type | Critere dacceptation |
| --- | --- | --- |
| Inscription | Unit + E2E | Creation 201, doublon 409, validation email/mdp 400 |
| Connexion | Unit + E2E | Retour dun JWT 200, rejet 401 si identifiants invalides |
| Upload | Unit + E2E | Retour dun lien public, date dexpiration, metadonnees en base |
| Download public | Unit + E2E | Affichage des infos, telechargement possible, erreurs 404/410 gerees |
| Mot de passe fichier | Unit | 401 si absent ou incorrect, acces si correct |
| Historique | Unit + E2E | Lutilisateur voit seulement ses fichiers |
| Suppression | Unit | Le fichier physique et la ligne en base sont supprimes |
| Purge cron | Manuel + integration | Les fichiers expires disparaissent du disque et de la base |

## Commandes dexecution

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

## Couverture cible

- Objectif indicatif : `>= 70%`
- Rapport attendu : `backend/coverage/lcov-report/index.html`

## Scenarios E2E Cypress

- `auth.cy.ts` : inscription, connexion, rejet dun mauvais login, redirection dune route protegee
- `upload.cy.ts` : upload, affichage du lien public, apparition dans lhistorique
- `download.cy.ts` : page publique, telechargement, erreur sur token invalide

## Etat actuel

- Les tests unitaires backend (Jest) couvrent les services `AuthService` et `FilesService`.
- Les tests E2E backend verifient le controller `AuthController` via Supertest.
- Les tests E2E frontend (Cypress) couvrent les 3 parcours critiques.
- Le rapport de couverture est generable via `npm run test:cov` dans le dossier backend.
