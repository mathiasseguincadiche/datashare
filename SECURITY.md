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

```bash
cd backend
npm audit
```

Frontend :

```bash
cd frontend
npm audit
```

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
