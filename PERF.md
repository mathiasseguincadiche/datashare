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

Voir : `scripts/k6-file-info.js`

Commande :

​
FILE_TOKEN=ton_token k6 run scripts/k6-file-info.js

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

## Resultat du test de charge (2026-04-22)

Execution sur la VM `datashare-dev` (Debian 13), backend NestJS + PostgreSQL 15 actifs en local.

Commande lancee :

​
FILE_TOKEN=51829298-c271-49a1-91b3-be32401977ac k6 run scripts/k6-file-info.js

Scenario : montee progressive jusqu a 50 VUs sur 50 s (3 stages).

Mesures obtenues cote backend :

- Requetes traitees : 2377
- Latence p50 : 5 ms    (budget < 200 ms) OK
- Latence p95 : 10 ms   (budget < 500 ms) OK
- Taux derreur : 0.00 % (budget < 1 %)    OK

Budget respecte avec une marge tres large : p50 environ 40x sous la cible, p95 environ 50x sous la cible.

## Limites du test

- Backend et k6 executes sur la meme machine : pas de latence reseau realiste.
- Scenario limite a la lecture (`GET /files/:token/info`) : lecriture (upload) na pas ete mesuree.
- Pas de soak test (longue duree) ni de spike test (pic brutal).
- En production, il faudrait refaire ce test depuis un client distant avec reseau reel.
