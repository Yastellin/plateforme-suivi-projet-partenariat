# Backend — Plateforme de suivi des projets et partenariats

API NestJS 11 + TypeORM + PostgreSQL 16 de l'Université de Fianarantsoa.

## Stack

| Élément | Choix |
|---|---|
| Framework | NestJS 11 |
| ORM | TypeORM 0.3 (`synchronize: false`, migrations versionnées) |
| Base de données | PostgreSQL 16 |
| Authentification | JWT (access 1 h + refresh 7 j, rotation des refresh tokens) |
| Documentation | Swagger sur `/api/docs` |

## Démarrage

```bash
npm install

# 1. Variables d'environnement
cp .env.example .env        # renseigner DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

# 2. Schema de la base (migrations TypeORM)
npm run migration:run

# 3. Donnees de demonstration (optionnel)
npm run seed                # comptes de test avec le mot de passe "password123"

# 4. API
npm run start:dev           # http://localhost:3000/api
```

Comptes créés par le seed :

| Compte | Rôle |
|---|---|
| `presidence@univ-fianarantsoa.mg` | PRESIDENCE |
| `fds@univ-fianarantsoa.mg` | ETABLISSEMENT (Faculté des Sciences) |
| `flsh@univ-fianarantsoa.mg` | ETABLISSEMENT (Faculté des Lettres et Sciences Humaines) |
| `president@univ-fianarantsoa.mg` | DECIDEUR |

## Migrations

```bash
npm run migration:run        # applique les migrations en attente
npm run migration:revert     # annule la derniere migration
npm run migration:generate -- src/database/migrations/NomDeLaMigration
```

Le schéma initial (`src/database/migrations/1791200000000-InitSchema.ts`) est
**généré automatiquement à partir des entités** :

```bash
npx ts-node scripts/generer-migration-initiale.ts --verifier
```

Ce script démarre un PostgreSQL en mémoire, laisse TypeORM construire le
schéma, contrôle l'absence de dérive avec les entités puis réécrit la
migration initiale. Ne pas modifier ce fichier à la main.

## Tests

```bash
npm test          # tests unitaires (Jest)
npm run test:e2e  # tests d'integration HTTP (NestJS + PostgreSQL en memoire)
npm run lint      # ESLint
npm run format    # Prettier
```

Les tests d'intégration utilisent **PGlite** (PostgreSQL compilé en WebAssembly,
exposé sur une socket TCP) : ils appliquent réellement les migrations, jouent le
seed puis interrogent l'API complète via HTTP. Aucun Docker ni service externe
n'est nécessaire.

> `npm run test:e2e` active `--experimental-vm-modules` (requis par PGlite sous
> Jest) via `cross-env`, y compris sous Windows.

## Contrat d'API

Toutes les réponses respectent l'enveloppe `ITDCMADA` :

```json
{ "status": "success", "message": "Opération réussie", "data": { }, "signature": "ITDCMADA" }
```

En cas d'erreur : `status: "error"`, `data: null`, `errors: [...]`.

Les codes d'erreur PostgreSQL sont traduits en HTTP : `23505` → 409,
`23503` → 409, `23502` → 400, `22P02` → 400, indisponibilité → 503.

## Règles de dates

| Règle | Portée |
|---|---|
| La date de début ne peut pas être antérieure au jour courant | Création uniquement (projets, partenariats, conventions, cotutelles) |
| La date d'échéance doit être postérieure à la date de début | Création et modification, dès que les deux dates sont fournies |

Ces règles sont portées par `src/common/validators/dates.validator.ts`
(`@EstDateNonPassee()` et `@EstPosterieurA('date_debut')`) et appliquées aux DTO
de création ; les DTO de modification redéclarent la date de début sans la
première règle. Les comparaisons se font au jour près, dans le fuseau
`TZ_APPLICATION` (défaut `Indian/Antananarivo`).

## Scripts d'outillage

| Script | Rôle |
|---|---|
| `scripts/generer-migration-initiale.ts` | Régénère la migration initiale depuis les entités (`--verifier` compare au schéma historique) |
| `scripts/verifier-migrations.ts` | Applique toutes les migrations sur une base vierge et contrôle l'absence de dérive |
| `scripts/serveur-pglite.ts` | Démarre un PostgreSQL en mémoire sur un port TCP (vérifications locales sans Docker) |

## Vérifications avant livraison

| Commande | Résultat attendu |
|---|---|
| `npm run build` | `dist/main.js` présent (≈ 243 fichiers `.js`) |
| `npm test` | 5 suites, 37 tests |
| `npm run test:e2e` | 7 suites, 83 tests |
| `npm run lint` | 0 erreur |
| `npm run migration:run` | applique `InitSchema` puis `CreatePasswordResetTokens` |

> **Piège corrigé** : `nest build` supprime `dist/` (`deleteOutDir`) ; lorsque le
> fichier d'informations incrémentales se trouve à la racine du projet, tsc croit
> la compilation déjà effectuée et **n'émet rien** tout en sortant en code 0
> (`dist/` absent, image Docker inutilisable). `tsconfig.build.json` place donc
> `tsBuildInfoFile` dans `dist/` et `*.tsbuildinfo` est ignoré par Git.

## Déploiement

`backend/Dockerfile` compile l'application puis démarre avec :

```sh
npx typeorm migration:run -d dist/database/data-source.js && node dist/main
```

Les migrations sont donc appliquées automatiquement à chaque démarrage du
conteneur (sans `ts-node`).
