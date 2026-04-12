# PERF.md

## Objectif

Suivre le comportement dun endpoint critique et fixer un budget simple de performance.

## Endpoint critique retenu

- `GET /files/:token/info`

Cet endpoint est le plus simple a solliciter en volume pour verifier :

- le temps de reponse backend
- le taux derreur
- la latence generale de consultation du lien public

## Script k6

Voir :

- [`scripts/k6-file-info.js`](./scripts/k6-file-info.js)

Commande :

```bash
FILE_TOKEN=ton_token k6 run scripts/k6-file-info.js
```

## Budget de performance cible

- Temps de reponse median backend : `< 200 ms`
- P95 backend : `< 500 ms`
- Taux derreur : `< 1%`
- Bundle frontend initial : a maintenir sous un niveau raisonnable pour Vite
- Navigation `/download/:token` : affichage lisible sans blocage perceptible

## Mesures front a observer

- temps de chargement de la page de download
- temps daffichage des informations fichier
- reactivite du formulaire dupload

## Mesures back a observer

- latence de `GET /files/:token/info`
- latence de `POST /files/upload`
- temps de suppression dun fichier
- comportement de la purge quotidienne

## Etat actuel

- Le script k6 est versionne dans le depot.
- Le budget de performance est verifie via `k6 run` sur lenvironnement local avec PostgreSQL actif.
