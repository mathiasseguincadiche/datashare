# SECURITY.md

## Mesures implementees

- Hash bcrypt pour les mots de passe utilisateur
- Hash bcrypt pour la protection optionnelle des fichiers
- JWT obligatoire pour les endpoints prives
- Validation globale des DTO avec `ValidationPipe`
- Refus des champs non whitelistes
- Limitation de taille de fichier
- Extensions dangereuses interdites : `.exe`, `.bat`, `.cmd`, `.com`, `.msi`, `.sh`
- Non exposition des ressources appartenant a un autre utilisateur lors de la suppression

## Commandes de verification recommandees

Backend :
cd backend
npm audit

Frontend :
cd frontend
npm audit

## Resultat de l'audit (2026-04-22)

Backend : `found 0 vulnerabilities`.

Frontend : 3 CVE moderees detectees.

| Package | CVE | Decision |
| --- | --- | --- |
| `follow-redirects` <= 1.15.11 | GHSA-r4q5-vmmm-2653 | Corrigee via `npm audit fix` (non-breaking) |
| `esbuild` <= 0.24.2 | GHSA-67mh-4wv8-2f99 | Acceptee (dev-server uniquement) |
| `vite` <= 6.4.1 | depend de esbuild | Acceptee (meme chaine que esbuild) |

Justification des CVE acceptees : la faille esbuild n'est exploitable que pendant `npm run dev` (serveur de developpement sur `localhost:5173`). En production, Vite produit des fichiers statiques via `npm run build`, esbuild n'est plus execute. Le correctif automatique (`npm audit fix --force`) installerait `vite@8.0.9`, version majeure breaking, incompatible avec le plugin React actuel.

Mitigation pendant le dev : ne pas exposer le dev-server sur internet (bind `localhost` uniquement).

## Decision de securite

- Le stockage local est accepte pour le prototype, avec dossier dedie `backend/uploads`
- `synchronize: true` TypeORM est autorise uniquement en developpement
- Les secrets restent en variables denvironnement, jamais en dur dans les scripts dexploitation
- Les routes publiques `GET /files/:token/info` et `POST /files/:token/download` sont volontairement separees des routes JWT pour eviter les faux positifs dauthentification

## Risques restants

- Pas de rate limiting applicatif sur auth et download
- Pas de scan antivirus des fichiers
- Pas de chiffrement au repos du dossier `uploads`
- Pas de HTTPS local par defaut, seulement recommande en production

## Actions recommandees avant livraison finale

- Executer `npm audit` front et back et documenter les decisions
- Ajouter rate limiting sur auth et upload si le temps le permet
- Passer a un stockage objet securise si le prototype evolue
