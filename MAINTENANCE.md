# MAINTENANCE.md

## Objectif

Maintenir le prototype DataShare dans un etat stable, lisible et securise.

## Mise a jour des dependances

Frequence recommandee :

- hebdomadaire pour lecture des alertes de securite
- mensuelle pour mise a jour non critique
- ponctuelle en cas dalerte de securite haute

Procedure :

1. Mettre a jour les dependances backend.
2. Executer les tests backend.
3. Mettre a jour les dependances frontend.
4. Executer les tests Cypress.
5. Verifier la documentation et la compatibilite de lenvironnement.

## Risques a surveiller

- incompatibilites majeures NestJS / TypeORM
- rupture de contrat API entre frontend et backend
- regressions sur les routes publiques de download
- effets de bord sur la gestion des dates dexpiration

## Procedure de correction

1. Reproduire le bug avec un test ou un scenario manuel.
2. Identifier si le bug est front, back, BDD ou stockage.
3. Corriger dans une branche dediee.
4. Verifier auth, upload, history, download et delete.
5. Documenter la correction si elle impacte le runbook ou les prerequis.

## Donnees et stockage

- Les metadonnees vivent dans PostgreSQL.
- Les fichiers physiques vivent dans `backend/uploads`.
- La purge cron doit rester coherente avec la suppression manuelle.
- En cas dincident disque, verifier le ratio entre fichiers physiques et lignes en base.

## Sauvegarde minimale conseillee

- dump regulier de la base PostgreSQL
- sauvegarde du dossier `backend/uploads`
- copie du `.env.example` et des scripts dinstallation
