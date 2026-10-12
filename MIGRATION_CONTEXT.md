# Contexte de migration Prisma vers TypeORM

## Objectif

Migrer l'intégralité du backend NestJS de Prisma vers TypeORM, sans changer :
- Les endpoints API (mêmes URLs, mêmes méthodes).
- Les formats de réponse (enveloppe ITDCMADA).
- Les règles métier (RG01 à RG44).
- Les permissions (Présidence, Établissement, Décideur).
- Les comportements (soft-delete, archivage, etc.).

## Stack cible

- Framework : NestJS 11
- ORM : TypeORM (avec @nestjs/typeorm)
- Base de données : PostgreSQL 16
- Pilote : pg

## Contraintes

- Aucun changement de contrat API.
- Aucun changement de comportement métier.
- Les tests PowerShell (`test-*.ps1`) doivent passer à l'identique.

## État de la migration

Terminé :

| Étape | Détail |
|---|---|
| Entités TypeORM | 28 entités (27 tables métier + `password_reset_tokens`) |
| Schéma initial | `src/database/migrations/1791200000000-InitSchema.ts`, généré depuis les entités, parité vérifiée avec l'ancien schéma Prisma (217 colonnes) |
| Purge de Prisma | dépendances, `PrismaModule`, `PrismaService`, seed et dossier `prisma/` supprimés |
| Healthcheck | interroge la base via le `DataSource` TypeORM |
| Garde « propre établissement » | réécrit sur les repositories TypeORM |
| Filtre d'exceptions | traduit désormais les codes d'erreur PostgreSQL (23505, 23503, 22P02…) |
| Seed | `npm run seed` (TypeORM), mêmes données que l'ancien seed Prisma |
| Docker | `backend/Dockerfile` applique les migrations TypeORM au démarrage |
| Tests | unitaires (`npm test`, 5 suites / 37 tests) et d'intégration HTTP (`npm run test:e2e`, 7 suites / 83 tests) sur PostgreSQL en mémoire |
| Build | `nest build` corrigé (voir « Pièges ») ; `npm run build` produit bien `dist/` |
| Dépendances | `dotenv` déclaré (utilisé par le DataSource et le seed) ; imports `express` en `import type` |

Reste à faire :

- Modules `activites`, `chronogramme`, `utilisateurs` : dossiers présents mais
  fichiers vides (fonctionnalités non implémentées, non appelées par les
  scripts `test-*.ps1`). L'entité `Chronogramme` a été créée pour préserver le
  schéma.
- `conventions/etape-circuit.service.ts`, `common/pipes/parse-pagination.pipe.ts`,
  `notifications/listeners/document.listener.ts` et
  `notifications/rules/activite-retard.rule.ts` : vides (même cas).

## Validation

```bash
cd backend
npx tsc --noEmit -p tsconfig.json   # 0 erreur
npm run build                       # dist/main.js + ~243 fichiers .js
npm test                            # 5 suites / 37 tests
npm run test:e2e                    # 7 suites / 83 tests
npm run lint                        # 0 erreur
```

Aucun Docker n'est nécessaire : les tests d'intégration démarrent un PostgreSQL
réel en mémoire (PGlite, exposé sur une socket TCP) et appliquent les vraies
migrations.

## Pièges

- **`nest build` silencieux** : `deleteOutDir` supprime `dist/` alors que
  `tsconfig.build.tsbuildinfo` (commenté dans le dépôt) indiquait à tsc que tout
  était déjà émis → aucun fichier produit, code de sortie 0, image Docker
  inutilisable. `tsBuildInfoFile` est désormais dans `dist/` et
  `*.tsbuildinfo` est ignoré par Git.
- **`tsconfig.build.json`** exclut `scripts/` et `test/` : ces dossiers ne
  doivent pas entrer dans le programme de compilation (`TS6059`).

## Ordre de migration

1. Auth (le plus simple)
2. Établissements
3. Partenaires + Contacts
4. Partenariats
5. Projets
6. Cotutelles
7. Documents
8. Conventions
9. Publications
10. Notifications
11. Tableau de bord + Statistiques
12. Référentiels
13. Archives + Recherche
14. Cleanup + Health

## Règles métier critiques

[Voir le cahier des charges pour RG01-RG44]

## Repères utiles

- **Écart de type assumé** : les identifiants sont `uuid` (et non `text`) dans
  les entités, et les chaînes `varchar` (et non `text`). Les colonnes et
  nullabilités sont identiques à l'ancien schéma ; seul le type diffère, ce qui
  est plus strict (un identifiant non-UUID rejeté par PostgreSQL est traduit en
  HTTP 400).
- **Base existante** : la migration initiale ne fait rien si la table
  `Utilisateur` existe déjà (base créée avec les migrations Prisma).
- **Référence historique** : l'ancien `migration.sql` Prisma reste consultable
  dans l'historique Git (`git show 7d44467:backend/prisma/migrations/20261002082033_init/migration.sql`).
