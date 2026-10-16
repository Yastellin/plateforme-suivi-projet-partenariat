# PLATEFORME DE GESTION ET DE SUIVI DES PROJETS ET PARTENARIATS DE L'UNIVERSITÉ DE FIANARANTSOA

## Cahier des charges

**Version 5 — mise à jour à partir du document de référence et de l'analyse du code source**

---

## Fiche du document

| Élément | Valeur |
|---|---|
| Intitulé | Cahier des charges de la plateforme de gestion et de suivi des projets et partenariats |
| Maître d'ouvrage | Université de Fianarantsoa — équipe Projet et Partenariat (Présidence) |
| Version précédente | Cahier des charges version 4, consolidée à partir des échanges avec l'équipe Projet et Partenariat (fichier `Cahier des de charges.pdf`, document Word `cahier_des_charges_UF_v4 (1).docx`, généré le 16/10/2026) |
| Version courante | Version 5 |
| Sources de la mise à jour | (1) le cahier des charges v4 fourni ; (2) le contenu du dépôt de code au commit `c1b5dae` de la branche `develop` : 257 fichiers TypeScript côté back-end, 307 fichiers côté front-end, 2 migrations SQL, 20 scripts de recette PowerShell, les fichiers de contexte `README.md`, `MIGRATION_CONTEXT.md` et `SUIVI_TECHNIQUES.md` |
| Méthode | Chaque affirmation de cette version est issue soit du document v4, soit d'un fichier du dépôt explicitement cité. Aucune fonctionnalité n'est décrite ici sans référence à un fichier, un endpoint, une table ou un script existant. |
| Règle appliquée | Lorsqu'une information n'a pas pu être établie à partir du document ou du code, elle n'est pas supposée : elle est signalée par la mention **À PRÉCISER** (chapitre 14) |
| Date de rédaction | 16 octobre 2026 |

### Comment lire cette version 5

La version 5 conserve l'intégralité du contenu fonctionnel de la version 4 (contexte, périmètre, besoins, règles de gestion RG01 à RG44, parcours, écrans, exigences non fonctionnelles). Elle y ajoute trois apports :

1. **L'architecture technique réelle** du projet (chapitre 3) et le **modèle de données tel qu'implémenté** (chapitre 4), qui n'existaient pas dans la version 4.
2. Pour chaque module fonctionnel, une mention d'état : **Implémenté**, **Partiel** ou **Absent**, avec les endpoints, écrans et fichiers correspondants (chapitre 5).
3. Une **confrontation des 44 règles de gestion au code** (chapitre 6) et un **inventaire des écarts et des informations manquantes** (chapitres 13 et 14).

### Conventions de notation utilisées

| Marqueur | Signification |
|---|---|
| **Implémenté** | La fonctionnalité existe dans le code et est atteignable via l'API ou l'interface |
| **Partiel** | Une partie de la fonctionnalité existe ; le reste est absent ou restreint à un rôle non prévu par la version 4 |
| **Absent** | La fonctionnalité est décrite dans la version 4 mais aucune implémentation n'a été trouvée |
| **Ajout v5** | Élément présent dans le code et non décrit dans la version 4 |
| **À PRÉCISER** | Information non établie, à confirmer par l'équipe Projet et Partenariat ou par la maîtrise d'œuvre |

---

## Sommaire

<!-- TOC -->

---

# 1. Présentation du projet

## 1.1. Contexte

*(Contenu repris de la version 4, sans modification.)*

L'Université de Fianarantsoa entretient différentes relations de partenariat avec des entreprises, des institutions, des organismes, des universités ainsi que d'autres acteurs externes. Ces collaborations peuvent conduire à la mise en œuvre de projets dans différents domaines, notamment la formation, la recherche, l'innovation, le développement et la coopération institutionnelle.

Les établissements de l'Université participent également à ces collaborations et peuvent disposer de leurs propres partenaires, partenariats et projets. Afin que ces informations puissent être connues au niveau central, chaque établissement doit pouvoir ajouter les informations relatives à ses propres projets et partenariats dans une plateforme commune.

Au niveau de la Présidence, l'équipe Projet et Partenariat joue un rôle central dans le suivi et la gestion globale des informations relatives aux collaborations de l'Université. Elle doit pouvoir connaître les partenaires des différents établissements, suivre les projets en cours, consulter les informations relatives aux bailleurs, bénéficiaires, porteurs et sites concernés, gérer les documents associés et conserver les conventions signées dans des archives numériques.

L'équipe assure également le suivi des cotutelles de thèses avec les universités partenaires, ainsi que la production d'une synthèse nationale de l'activité de coopération de l'Université.

Le présent projet consiste à concevoir et développer une plateforme web centralisée destinée à faciliter la gestion, le suivi, la consultation et l'archivage de ces informations.

## 1.2. Problématique

*(Contenu repris de la version 4, sans modification.)*

Comment concevoir et mettre en place une plateforme web simple, centralisée et adaptée aux besoins de l'Université de Fianarantsoa, permettant aux établissements d'ajouter leurs propres projets et partenariats, tout en permettant à l'équipe Projet et Partenariat de la Présidence d'assurer la gestion globale, le suivi, la consultation et l'archivage des informations ?

## 1.3. Objectif général

*(Contenu repris de la version 4.)*

Concevoir et développer une plateforme web permettant de centraliser, gérer, suivre et archiver les informations relatives aux projets et partenariats de l'Université de Fianarantsoa et de ses établissements, en remplaçant progressivement le suivi actuellement réalisé sous Excel.

## 1.4. Objectifs spécifiques

*(Contenu repris de la version 4, enrichi d'une mention d'état entre crochets.)*

- Faciliter l'enregistrement et la consultation des informations relatives aux partenaires, aux partenariats, aux cotutelles de thèses et aux projets. **[Implémenté — voir chapitre 5]**
- Conserver les informations propres à chaque projet : nom, intitulé officiel, type, domaine, durée, budget total, porteur, bailleur(s), bénéficiaires, sites concernés. **[Implémenté]**
- Suivre les activités et leur chronogramme mensuel/trimestriel en nombre de jours, gérer les documents associés (termes de référence, descriptions de projet, conventions), et archiver les conventions signées. **[Partiel — le suivi des activités et le chronogramme ne sont pas implémentés ; les documents le sont pour la Présidence]**
- Fournir à l'équipe Projet et Partenariat une vision globale, y compris une synthèse annuelle par établissement générée automatiquement à partir des données enregistrées. **[Implémenté]**
- Fournir au Décideur une vue de consultation, et aux visiteurs un accès aux informations publiques. **[Implémenté]**
- Proposer aux établissements un espace de gestion minimal, séparé de l'espace public, leur permettant d'ajouter et de mettre à jour leurs propres projets et partenariats sans complexité technique. **[Implémenté]**
- Intégrer un système de notifications informant les utilisateurs concernés des événements importants : ajout d'un nouveau projet ou partenariat par un établissement, conventions approchant de leur expiration ou expirées, activités et projets en retard. **[Partiel — seules l'expiration de convention, la convention expirée, la soumission de projet/partenariat et le retard de projet sont implémentés]**

---

# 2. Périmètre, acteurs et droits d'accès

## 2.1. Les quatre catégories d'acteurs

*(Contenu repris de la version 4.)*

Le système concerne quatre catégories d'acteurs : l'équipe Projet et Partenariat de la Présidence, les établissements, le Décideur et les visiteurs.

| Acteur | Rôle tel que spécifié |
|---|---|
| Équipe Projet et Partenariat (Présidence) | Principal gestionnaire fonctionnel : vision globale, gestion des partenaires, partenariats, cotutelles, projets, conventions, documents, archives et publications ; production de la synthèse annuelle |
| Établissement | Espace de gestion minimal et cloisonné, dédié à ses propres partenaires, partenariats et projets |
| Décideur | Vue globale de consultation en lecture seule (indicateurs agrégés et détail des fiches) |
| Visiteur | Utilisateur externe sans compte, accès aux seules informations rendues publiques |

## 2.2. Comptes et rattachement — état réel dans le code

| Point spécifié (v4) | État constaté dans le dépôt |
|---|---|
| Un compte unique pour la Présidence (RG01) | **Partiel** : la table `Utilisateur` porte un rôle `PRESIDENCE` ; le code accepte plusieurs comptes Présidence (les notifications sont adressées à **tous** les utilisateurs `PRESIDENCE` actifs — `notifications.service.ts`, méthode `trouverUtilisateursPresidence`). Aucune contrainte d'unicité n'existe en base. Le jeu de démonstration (`backend/src/database/seed.ts`) crée un seul compte Présidence. |
| Un compte unique par établissement, associé à un seul établissement (RG02) | **Partiel** : `Utilisateur.etablissement_id` est une clé étrangère nullable, associée au rôle `ETABLISSEMENT`. Aucune contrainte d'unicité n'interdit plusieurs comptes pour un même établissement. Le jeu de démonstration crée un compte établissement pour chacune des deux facultés de test. |
| Un ou plusieurs comptes Décideur, non rattachés à un établissement (RG03) | **Implémenté** : rôle `DECIDEUR`, `etablissement_id` nullable ; un compte Décideur dans le jeu de démonstration. |
| Visiteur sans compte (RG04) | **Implémenté** : routes publiques `GET /api/public/accueil`, `/public/publications`, `/public/publications/:id`, `/public/etablissements`, `/public/partenaires`, ainsi que `POST /api/auth/login`, `POST /api/auth/mot-de-passe-oublie`, `POST /api/auth/reinitialiser-mot-de-passe`, `POST /api/auth/refresh` et `GET /api/health` (décorateur `@Public()`). |
| Création des comptes hors périmètre fonctionnel | **Conforme** : aucun endpoint de création, modification ou désactivation de compte n'existe. Les comptes sont créés par le script `backend/src/database/seed.ts` ou directement en base. Le module `backend/src/utilisateurs/` existe mais ses cinq fichiers sont **vides**. |
| Détermination automatique du rôle et orientation vers l'espace correspondant | **Implémenté partiellement** : le rôle est porté par le jeton JWT (`auth.strategies/jwt.strategy.ts`) et exploité par `RolesGuard` ; la redirection par rôle est faite côté front-end (`frontend/src/router.tsx` : préfixes `/presidence`, `/etablissement`, `/decideur`, et `frontend/src/lib/roles.ts`). Les mots de passe sont hachés avec bcrypt (coût 10). |

## 2.3. Choix écarté en v4, rappelé pour mémoire

L'intégration de la saisie établissement directement dans les pages publiques a été envisagée puis écartée : un espace de gestion dédié et minimal (liste de ses éléments + formulaire d'ajout) a été retenu. **Cet arbitrage est respecté par l'implémentation** : les pages `frontend/src/features/espace-public/**` sont entièrement séparées des pages de gestion `frontend/src/features/<domaine>/pages/**`.

---

# 3. Architecture technique (chapitre nouveau en version 5)

Cette section décrit l'architecture **réellement présente dans le dépôt**. Elle ne figurait pas dans la version 4, qui s'arrêtait aux besoins fonctionnels.

## 3.1. Vue d'ensemble

| Couche | Technologie | Emplacement |
|---|---|---|
| Interface web | React 19 + TypeScript + Vite 8, Tailwind CSS 4, composants shadcn/Radix | `frontend/` |
| API | NestJS 11 (architecture modulaire, contrôleurs + services + DTO) | `backend/` |
| Accès aux données | TypeORM 0.3 (entités + migrations versionnées, `synchronize: false`) | `backend/src/database/` |
| Base de données | PostgreSQL 16 | service `db` de `docker-compose.yml` |
| Stockage de fichiers | Disque local via un port de stockage (`StoragePort`), servi en statique sur `/uploads/` | `backend/src/storage/`, `backend/uploads/` |
| Messagerie sortante | Port `MailPort` avec deux adaptateurs : `noop` (journalisation) et `smtp` (Nodemailer) | `backend/src/mail/` |
| Orchestration | Docker Compose : trois services (`frontend`, `backend`, `db`) | `docker-compose.yml` |
| Tests | Jest + Supertest (API), PostgreSQL en mémoire PGlite, Vitest (front-end), 20 scripts PowerShell de recette | `backend/test/`, `frontend/tests/`, `test-*.ps1` |

Le dépôt est un monorepo à deux applications : `frontend/` et `backend/`, sans espace de travail npm partagé (deux `package.json` indépendants).

## 3.2. Back-end : dépendances et versions déclarées

| Domaine | Dépendance et version déclarée |
|---|---|
| Framework | `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` `^11.0.0` |
| Configuration | `@nestjs/config` `^4.0.0`, `dotenv` `^18.0.7` |
| Persistance | `@nestjs/typeorm` `^11.0.3`, `typeorm` `^0.3.31`, `pg` `^8.23.1` |
| Authentification | `@nestjs/jwt` `^11`, `@nestjs/passport` `^11`, `passport` `^0.7`, `passport-jwt` `^4.0.1`, `bcrypt` `^5.1.1` |
| Sécurité HTTP | `helmet` `^8.3.0`, `@nestjs/throttler` `^6.0.0` |
| Validation | `class-validator` `^0.14.1`, `class-transformer` `^0.5.1`, `libphonenumber-js` `^1.13.14` |
| Tâches planifiées et événements | `@nestjs/schedule` `^5.0.0`, `@nestjs/event-emitter` `^3.0.0` |
| Documentation d'API | `@nestjs/swagger` `^11`, `swagger-ui-express` `^5.0.1` |
| Fichiers et exports | `multer` `^1.4.5-lts.1`, `exceljs` `^4.4.0`, `pdfkit` `^0.15.0` |
| E-mail | `nodemailer` `^10.0.15` |
| Divers | `uuid` `^11`, `rxjs` `^7.8.1` |
| Tests (dev) | `@electric-sql/pglite` `^0.5.9`, `@electric-sql/pglite-socket` `^0.2.12`, `jest` `^29.7`, `ts-jest` `^29.2`, `supertest` `^7`, `cross-env` `^10`, `typescript` `^5.7`, `eslint` `^9`, `prettier` `^3.4` |

## 3.3. Front-end : dépendances et versions déclarées

| Domaine | Dépendance et version déclarée |
|---|---|
| Bibliothèque d'interface | `react` `^19.2.8`, `react-dom` `^19.2.8` |
| Routage | `react-router-dom` `^7.18.3` |
| Données et appels réseau | `@tanstack/react-query` `^5.102.8`, `axios` `^1.20.0` |
| Formulaires et validation | `react-hook-form` `^7.87.0`, `@hookform/resolvers` `^5.9.1`, `zod` `^4.5.4` |
| Style et composants | `tailwindcss` `^4.3.3` + `@tailwindcss/vite`, `radix-ui` `^1.6.7`, `shadcn` `^4.21.0`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` |
| Graphiques et animation | `recharts` `^3.10.1`, `framer-motion` `^13.2.0` |
| Aides d'interface | `lucide-react` `^1.38`, `sonner` `^2.0.8`, `next-themes` `^0.4.6`, `react-dropzone` `^20.1.1`, `libphonenumber-js` `^1.13.14` |
| Typographie | `@fontsource-variable/inter`, `@fontsource-variable/plus-jakarta-sans`, `@fontsource-variable/jetbrains-mono` |
| Outils de développement | `vite` `^8.2.2`, `typescript` `~6.0.2`, `vitest` `^5.0.4`, `jsdom` `^30.1.2`, `oxlint` `^1.79.0` |

**À PRÉCISER** : `frontend/playwright.config.ts` référence une suite `./tests/e2e` qui **n'existe pas** dans le dépôt et la dépendance `@playwright/test` **n'est pas déclarée** dans `frontend/package.json`. La campagne `npm run test:e2e` côté navigateur n'est donc pas opérationnelle en l'état (voir chapitre 12).

## 3.4. Contrat d'API

*(Ajout v5 — normalisation observée dans `backend/src/common/interceptors/response.interceptor.ts` et `backend/src/common/filters/all-exceptions.filter.ts`.)*

Toutes les réponses de l'API respectent une enveloppe unique :

```json
{
  "status": "success",
  "message": "Opération réussie",
  "data": { },
  "errors": null,
  "signature": "ITDCMADA"
}
```

En cas d'erreur, `status` vaut `"error"`, `data` vaut `null` et `errors` contient la liste des messages. Le préfixe d'URL est `/api` (`backend/src/config/application.config.ts`), la documentation interactive est publiée sur `/api/docs` (`backend/src/main.ts`).

Les erreurs remontées par PostgreSQL sont traduites en réponses HTTP normalisées : violation d'unicité (`23505`) et violation de clé étrangère (`23503`) en **409**, violation de non-nullité (`23502`) et valeur de type invalide (`22P02`, par exemple un identifiant non UUID) en **400**, indisponibilité de la base en **503**.

**À PRÉCISER** : la signature `"ITDCMADA"` provient d'un modèle de projet antérieur ; sa signification et son maintien dans le contrat méritent une validation de la maîtrise d'ouvrage.

## 3.5. Sécurité

| Mesure | Mise en œuvre constatée |
|---|---|
| En-têtes HTTP | `helmet` activé, politique de sécurité de contenu désactivée car Swagger UI est servi par l'API (`application.config.ts`) |
| Validation d'entrée | `ValidationPipe` global avec `whitelist`, `forbidNonWhitelisted` et `transform` |
| Authentification | JWT en en-tête `Authorization: Bearer`, jeton d'accès d'une durée annoncée de 3 600 secondes (`expires_in: 3600`), jeton de rafraîchissement de 7 jours stocké **haché** en base et **tournant** à chaque rafraîchissement (`auth.service.ts`, `RefreshToken`) |
| Autorisation | `JwtAuthGuard` global, `RolesGuard` global (`@Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)`), `OwnEtablissementGuard` de cloisonnement par établissement |
| Limitation de débit | `ThrottlerGuard` global : 100 requêtes/minute et par IP en production, 1 000 en développement ; 5 tentatives de connexion par minute (50 en développement) ; 3 demandes de réinitialisation par minute ; 5 réinitialisations par minute |
| Réinitialisation de mot de passe | Jeton aléatoire de 32 octets, conservé uniquement haché, usage unique, expiration de 30 minutes par défaut (`MOT_DE_PASSE_RESET_EXPIRATION_MINUTES`) ; réponse identique que l'adresse existe ou non (anti-énumération) ; invalidation de toutes les sessions ouvertes après changement |
| Contrôle de configuration | `validerEnvironnement()` refuse le démarrage si `DATABASE_URL`, `JWT_SECRET` ou `JWT_REFRESH_SECRET` manquent, si les secrets font moins de 32 caractères ou s'ils reprennent une valeur par défaut ; si `MAIL_MODE=smtp`, les cinq variables SMTP deviennent obligatoires |
| Cloisonnement des établissements | `OwnEtablissementGuard` (contrôle sur les ressources `projets` et `partenariats` ciblées par identifiant) **et** filtrage systématique par `etablissement_id` dans les services `partenaires`, `projets`, `partenariats`, `archives`, `recherche`, `tableau-de-bord`, `export`, `synthese` |

## 3.6. Stockage des fichiers

- Les fichiers sont écrits sur le disque du serveur par `LocalStorageAdapter` dans `backend/uploads/`, dans des sous-dossiers `projets/<id>`, `conventions/<id>` ou `publications/<id>`, sous un nom de fichier aléatoire conservant l'extension d'origine.
- L'URL relative (`/uploads/...`) est enregistrée en base ; le dossier est servi en statique par NestJS et monté en volume Docker (`./backend/uploads:/app/uploads`).
- Formats et limites acceptés par le code : documents — PDF, JPEG, PNG, Word (`application/msword`, `.docx`), **10 Mo maximum** ; photos de publication — JPEG, PNG, WebP. Ce point répond à la version 4 qui renvoyait les formats et limites à la conception technique (chapitre 11.3).
- Un nettoyage quotidien (`CleanupSchedulerService`, 04 h 00) supprime les fichiers **orphelins** de plus de 24 heures, c'est-à-dire absents de toute référence `Document` ou `PhotoPublication` ; il peut aussi être déclenché manuellement par `POST /api/maintenance/nettoyage` (Présidence).

## 3.7. Déploiement et exploitation

| Élément | Mise en œuvre constatée |
|---|---|
| Services Docker Compose | `frontend` (Vite, cible `development`, port 5173), `db` (`postgres:16-alpine`, port 5432, volume `db_data`, `healthcheck` `pg_isready`), `backend` (port 3000, dépend de `db` en état sain, volume `./backend/uploads`) |
| Migrations | appliquées automatiquement au démarrage du conteneur back-end : `npx typeorm migration:run -d dist/database/data-source.js && node dist/main` (`backend/Dockerfile`) |
| Variables d'environnement | `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `VITE_API_URL`, `CORS_ORIGINS`, `MAIL_MODE`, `SMTP_*`, `FRONTEND_URL`, `MOT_DE_PASSE_RESET_EXPIRATION_MINUTES`, `TZ_APPLICATION` (fichiers `.env.example` à la racine et dans `backend/`) |
| Image front-end de production | étage `production` du `frontend/Dockerfile` (nginx 1.27 + `nginx.conf` avec repli SPA sur `index.html`) — non utilisé par `docker-compose.yml`, qui construit la cible `development` |
| Supervision | `GET /api/health` : état du service, horodatage, durée de fonctionnement et état de la base de données (interrogée via le `DataSource` TypeORM) |
| Tâches planifiées | purge des jetons expirés à 03 h 00 (`auth-scheduler.service.ts`), nettoyage des fichiers orphelins à 04 h 00 (`cleanup-scheduler.service.ts`), règles de notification à 06 h 00 (`notifications-scheduler.service.ts`) |

**À PRÉCISER** :
- Aucune configuration d'intégration continue (workflow GitHub Actions ou équivalent) n'a été trouvée dans le dépôt ; le contrôle qualité repose sur des commandes manuelles documentées.
- Les images de base diffèrent entre les deux applications (`node:20-alpine` côté back-end, `node:22-alpine` côté front-end) ; l'harmonisation n'est pas tranchée dans le dépôt.
- La variable `DB_POOL_MAX` (taille du pool PostgreSQL, défaut 10) est lue par `database.module.ts` mais **n'apparaît pas** dans les fichiers `.env.example`.
- Le fichier `backend/.env.example` conserve un paramètre hérité `?schema=public` dans l'exemple de `DATABASE_URL`, reliquat de l'ancienne couche Prisma mentionnée dans `MIGRATION_CONTEXT.md`.


---

# 4. Modèle de données tel qu'implémenté (chapitre nouveau en version 5)

## 4.1. Vue d'ensemble

Le schéma est produit par deux migrations TypeORM (`backend/src/database/migrations/`) :

| Migration | Contenu |
|---|---|
| `1791200000000-InitSchema.ts` | 27 tables, 10 types énumérés PostgreSQL, index et clés étrangères |
| `1791292246344-CreatePasswordResetTokens.ts` | 1 table supplémentaire (`PasswordResetToken`) |

**Total : 28 tables.** La version 4 prévoyait 25 entités (chapitre 7 du document v4). L'écart s'explique par :

| Table présente dans le code | Statut par rapport à la version 4 |
|---|---|
| `Utilisateur` | Prévue (modèle de données v4) |
| `Etablissement`, `Partenaire`, `Contact`, `Partenariat`, `PartenariatEtablissement`, `PartenariatPartenaire`, `CotutelleThese`, `Projet`, `ProjetPartenaire`, `ProjetBeneficiaire`, `Porteur`, `Bailleur`, `Beneficiaire`, `Site`, `ProjetSite`, `Activite`, `Chronogramme`, `Convention`, `Document`, `Publication`, `PhotoPublication`, `Notification`, `SyntheseItem`, `SynthesePartenaireStrategique` | Prévues |
| `ProjetBailleur` | **Non listée dans le modèle de données v4** alors que la règle RG09/§5.7 prévoit « un ou plusieurs bailleurs » par projet ; l'association est implémentée en table dédiée |
| `RefreshToken`, `PasswordResetToken` | **Non prévues** ; nécessaires au fonctionnement de l'authentification (rotation des jetons, réinitialisation de mot de passe) |

## 4.2. Description des tables

| Table | Colonnes principales | Remarques issues du code |
|---|---|---|
| `Utilisateur` | `id` (uuid), `email` (unique), `password_hash`, `role` (`Role`), `etablissement_id` (nullable), `actif`, `derniere_connexion`, `created_at`, `updated_at` | Index sur `role` ; aucun écran ni endpoint de gestion des comptes |
| `RefreshToken` | `token_hash`, `utilisateur_id`, `expires_at`, `revoked_at` | Rotation à chaque rafraîchissement ; purge quotidienne à 30 jours |
| `PasswordResetToken` | `token_hash`, `utilisateur_id`, `expire_le`, `utilise_le` | Usage unique ; les jetons antérieurs non utilisés sont invalidés à chaque nouvelle demande |
| `Etablissement` | `nom`, `sigle`, `logo_url`, `description`, `created_at`, `updated_at` | Index sur `nom` ; **lecture seule via l'API** |
| `Partenaire` | `nom`, `type`, `pays`, `adresse`, `telephone`, `email`, `site_web`, `description`, `statut` (`StatutPartenaire`), `visibilite` (`Visibilite`), `est_strategique`, `logo_url`, `archive`, `etablissement_id` | Index sur `etablissement_id`, `archive`, `nom`, `statut` |
| `Contact` | `nom`, `fonction`, `email`, `telephone`, `partenaire_id` | Un contact appartient à un seul partenaire (RG28) |
| `Partenariat` | `intitule`, `objet`, `domaine` (`DomainePartenariat`), `date_debut`, `date_fin` (nullable), `statut` (`StatutPartenariat`), `actions_realisees`, `actions_en_cours`, `actions_prevues`, `resultats_obtenus`, `difficultes_contraintes`, `perspectives_recommandations`, `archive` | Les six champs narratifs correspondent aux colonnes du fichier Excel de suivi de l'équipe, comme indiqué en v4 |
| `PartenariatEtablissement` | `partenariat_id`, `etablissement_id` | Contrainte d'unicité sur le couple |
| `PartenariatPartenaire` | `partenariat_id`, `partenaire_id` | Contrainte d'unicité sur le couple |
| `CotutelleThese` | `nom_doctorant`, `specialite`, `directeur_these_local`, `directeur_these_partenaire`, `type` (`TypeCotutelle`), `date_debut`, `date_prevue_soutenance`, `financement_bourse`, `mobilite_realisee`, `publications_produites`, `etat_avancement`, `difficultes_rencontrees`, `perspectives`, `archive`, `etablissement_id`, `partenaire_id`, `convention_id` (nullable) | Reprend les champs listés en v4 §5.6 |
| `Projet` | `nom`, `intitule_officiel` (nullable), `type`, `domaine` (nullable), `budget` (numeric 12,2 nullable), `date_debut`, `date_fin_prevue`, `statut` (`StatutProjet`), `archive`, `etablissement_id`, `partenariat_id` (nullable), `porteur_id` (nullable) | Index sur `etablissement_id`, `statut`, `archive`, `date_debut`+`date_fin_prevue`, `partenariat_id` |
| `ProjetPartenaire` / `ProjetBeneficiaire` / `ProjetBailleur` / `ProjetSite` | `<projet_id>`, `<entité>_id` | Tables d'association, unicité sur chaque couple |
| `Activite` | `intitule`, `ordre`, `terminee`, `date_echeance` (nullable), `projet_id` | Table alimentée uniquement par le jeu de démonstration : aucun endpoint ne permet de créer ou modifier une activité (voir §5.8) |
| `Chronogramme` | `annee`, `trimestre`, `mois`, `nombre_jours` (numeric 6,1), `activite_id` | Unicité sur (`activite_id`, `annee`, `trimestre`, `mois`) ; aucun endpoint (voir §5.8) |
| `Convention` | `reference` (unique), `titre`, `date_signature` (nullable), `date_debut` (nullable), `date_fin` (nullable), `statut` (`StatutConvention`), `description`, `archive`, `partenariat_id` (nullable), `projet_id` (nullable) | **Aucune colonne d'étape de circuit de traitement** (voir §5.10) |
| `Document` | `nom_fichier`, `url_fichier`, `type` (`TypeDocument`), `version` (entier, défaut 1), `est_archive`, `projet_id` (nullable), `convention_id` (nullable) | Historique de versions géré automatiquement au téléversement |
| `Publication` | `titre`, `description_publique`, `date_publication` (nullable), `statut` (`StatutPublication`), `resultats`, `projet_id` (**unique**) | Un projet ne peut avoir qu'une publication (RG29) |
| `PhotoPublication` | `url_fichier`, `legende` (nullable), `ordre` (entier, défaut 0), `publication_id` | Ordre d'affichage et légende facultatifs, comme en v4 §5.18 |
| `Notification` | `titre`, `message`, `type` (`TypeNotification`), `priorite` (`PrioriteNotification`), `date_creation`, `est_lue`, `utilisateur_id`, `reference_type`, `reference_id`, `created_at`, `updated_at` | Reprend exactement les attributs prévus en v4 §7.1. `utilisateur_id` est **obligatoire** : la diffusion à un « groupe » se fait par duplication de la notification pour chaque utilisateur actif concerné |
| `Porteur` | `nom`, `institution_rattachement` (nullable) | Champ secondaire non précisé en v4 §5.8, implémenté |
| `Bailleur` | `nom`, `description` (nullable) | Confirmé par la v4 §5.9 : « a minima un nom et une description » |
| `Beneficiaire` | `nom`, `categorie` (nullable), `description` (nullable) | Champ `categorie` non prévu explicitement en v4 |
| `Site` | `nom`, `description` (nullable) | Conforme à v4 §5.11 |
| `SyntheseItem` | `etablissement_id`, `annee`, `type`, `valeur` | Unicité sur (`etablissement_id`, `annee`, `type`) |
| `SynthesePartenaireStrategique` | `etablissement_id`, `annee`, `partenaire_id` | Unicité sur (`etablissement_id`, `annee`, `partenaire_id`) |

## 4.3. Types énumérés

| Énumération | Valeurs implémentées |
|---|---|
| `Role` | `PRESIDENCE`, `ETABLISSEMENT`, `DECIDEUR` |
| `StatutPartenaire` | `ACTIF`, `SUSPENDU` |
| `Visibilite` | `PUBLIC`, `PRIVE` |
| `DomainePartenariat` | `RECHERCHE`, `FORMATION`, `INNOVATION`, `DEVELOPPEMENT`, `COOPERATION_INSTITUTIONNELLE`, `AUTRE` |
| `StatutPartenariat` | `BROUILLON`, `EN_ATTENTE`, `EN_COURS`, `SUSPENDU`, `TERMINE` |
| `StatutProjet` | `BROUILLON`, `EN_ATTENTE`, `EN_COURS`, `SUSPENDU`, `EXPIRE`, `TERMINE` |
| `StatutConvention` | `BROUILLON`, `EN_ATTENTE_SIGNATURE`, `SIGNEE`, `ACTIVE`, `SUSPENDUE`, `EXPIREE` |
| `TypeCotutelle` | `COTUTELLE`, `COENCADREMENT` |
| `TypeDocument` | `TDR`, `DESCRIPTION`, `CONVENTION`, `AUTRE` |
| `StatutPublication` | `BROUILLON`, `PUBLIEE` |
| `TypeNotification` | `PROJET_SOUMIS`, `PARTENARIAT_SOUMIS`, `EXPIRATION_CONVENTION`, `CONVENTION_EXPIREE`, `ACTIVITE_ECHEANCE`, `ACTIVITE_RETARD`, `PROJET_RETARD`, `DOCUMENT_AJOUTE`, `DOCUMENT_MODIFIE`, `CHANGEMENT_STATUT` |
| `PrioriteNotification` | `BASSE`, `MOYENNE`, `HAUTE` |

## 4.4. Écarts entre le modèle prévisionnel (v4) et le modèle implémenté

| Point du modèle v4 | Constat dans le code |
|---|---|
| Statuts de convention : « En préparation, En attente de signature, Signée, Active, Suspendue, Expirée et Archivée » (7 valeurs) | L'énumération `StatutConvention` compte **6 valeurs** : `BROUILLON` (équivalent de « En préparation »), `EN_ATTENTE_SIGNATURE`, `SIGNEE`, `ACTIVE`, `SUSPENDUE`, `EXPIREE`. Le statut « Archivée » est remplacé par le **drapeau booléen `archive`** de la convention |
| « Convention : comporte son étape de circuit de traitement » (v4 §7 et §5.15) | **Aucune colonne ni énumération** d'étape de circuit. Les fichiers `common/enums/etape-circuit.enum.ts`, `conventions/etape-circuit.service.ts`, `conventions/dto/update-etape-circuit.dto.ts` existent mais sont **vides** |
| « Notification associée à l'utilisateur ou au groupe d'utilisateurs concerné » (RG42) | `utilisateur_id` est une colonne obligatoire pointant un utilisateur ; il n'existe pas d'entité « groupe ». La diffusion est réalisée par boucle applicative |
| Compteurs de la synthèse non stockés (v4 §7) | **Conforme** : les compteurs sont calculés à la demande par requêtes (`synthese.service.ts`) |
| Tables d'association invisibles dans l'interface (v4 §7) | **Conforme** : les pages de sélection (`SelectionPartenaires.tsx`, `SelectionEtablissements.tsx`, `SelectionBeneficiaires.tsx`, `SelectionBailleurs.tsx`, `SelectionSites.tsx`, `SelectionPorteur.tsx`) présentent des listes à cocher, jamais les tables d'association |
| Identifiants `text` | Écart assumé et documenté dans `MIGRATION_CONTEXT.md` : les identifiants sont typés `uuid` et les chaînes `varchar` ; un identifiant non UUID est rejeté par PostgreSQL (`22P02`) et traduit en HTTP 400 |

---

# 5. Besoins fonctionnels et état d'implémentation

Ce chapitre reprend la numérotation fonctionnelle de la version 4 (sections 5.1 à 5.22) et ajoute les fonctionnalités présentes dans le code mais absentes du document de référence (sections 5.23 à 5.26). Chaque module indique son état, ses endpoints, ses écrans et ses limites constatées.

Rappel de convention : les routes sont données avec le préfixe global `/api`.

## 5.1. Authentification — **Implémenté, avec des ajouts non prévus en v4**

| Spécifié en v4 | Implémenté | Preuve |
|---|---|---|
| Authentification par identifiant et mot de passe | Oui, par adresse e-mail et mot de passe | `POST /api/auth/login` |
| Détermination automatique des droits du rôle | Oui, rôle porté par le JWT puis contrôlé par `RolesGuard` | `auth/strategies/jwt.strategy.ts`, `common/guards/roles.guard.ts` |
| Visiteur : accès public sans compte | Oui | Décorateur `@Public()` sur `espace-public.controller.ts`, `health.controller.ts` et quatre routes `auth` |

**Ajouts v5 (présents dans le code, non décrits en v4)** :

| Fonctionnalité ajoutée | Endpoint / fichier |
|---|---|
| Jeton d'actualisation avec rotation et révocation | `POST /api/auth/refresh`, `POST /api/auth/logout` |
| Mot de passe oublié par e-mail (lien à usage unique) | `POST /api/auth/mot-de-passe-oublie`, `POST /api/auth/reinitialiser-mot-de-passe` |
| Informations de l'utilisateur connecté | `GET /api/auth/me` |
| Limitation de débit sur les routes sensibles | `@Throttle` dans `auth.controller.ts` |
| Écrans dédiés | `connexion`, `mot-de-passe-oublie`, `reset-password` (`frontend/src/router.tsx`) |
| Mode d'envoi d'e-mail commutable | `MAIL_MODE=noop` (journalisation du lien) ou `smtp` |

**Limites constatées** : aucune gestion de comptes (création, désactivation, changement de mot de passe par l'utilisateur) n'est exposée par l'API (voir §5.25).

## 5.2. Établissements — **Implémenté en lecture seule**

| Spécifié en v4 | Implémenté |
|---|---|
| Nom, sigle éventuel, logo et description | Colonnes présentes dans la table `Etablissement` |
| Rattachement des partenaires, partenariats et projets | Clés étrangères effectives (`Partenaire.etablissement_id`, `Projet.etablissement_id`, `PartenariatEtablissement`) |
| Gestion administrative hors périmètre (RG33) | **Conforme** : seuls `GET /api/etablissements` et `GET /api/etablissements/:id` existent. Aucun endpoint de création, modification ou archivage n'existe |

**À PRÉCISER** : le mode d'alimentation initial de la table `Etablissement` (liste officielle des établissements, sigles et logos) n'est pas documenté dans le dépôt : seul le script de démonstration en crée deux.

## 5.3. Espace de gestion de l'établissement — **Implémenté**

| Spécifié en v4 | Implémenté | Preuve |
|---|---|---|
| Espace dédié, distinct de l'espace public | Oui : préfixe d'URL `/etablissement`, habillage interne (barre latérale, barre supérieure) distinct de la vitrine | `frontend/src/router.tsx`, `components/layout/SidebarInterne.tsx` |
| Consulter ses propres partenaires, partenariats et projets | Oui : listes filtrées par `etablissement_id` du compte connecté | `partenaires.controller.ts`, `partenariats.controller.ts`, `projets.controller.ts` |
| Ajouter ou modifier de nouveaux éléments | Oui : création et modification ; la modification d'un partenariat est réservée au statut `BROUILLON` (§5.5) | `POST` / `PATCH` sur les trois domaines |
| Rattachement automatique à l'établissement du compte | Oui : l'identifiant d'établissement est imposé depuis le jeton et **jamais** lu dans le corps de la requête pour un compte Établissement | `create()` des trois contrôleurs |
| Un établissement ne peut ni consulter ni modifier les données d'un autre | Oui, à deux niveaux : filtre d'établissement dans les listes et `OwnEtablissementGuard` sur les accès par identifiant | `common/guards/own-etablissement.guard.ts` |
| Recherche d'un partenaire existant avant création | Oui | `GET /api/partenaires/recherche-doublon?nom=...` |

**Limites constatées** :

- L'espace établissement du front-end ne propose **ni** conventions, **ni** documents, **ni** publications, **ni** recherche transverse, **ni** export, **ni** synthèse (voir chapitre 9). Ces écrans n'existent qu'avec le préfixe `/presidence` (ou `/decideur` en consultation), alors que la version 4 §12 prévoyait « les siens » pour les conventions, documents et publications.
- Le contrat d'API interdit de fait ces usages : `GET /api/conventions`, `GET /api/cotutelles`, `GET /api/documents`, `GET /api/publications` sont réservés à `PRESIDENCE` et `DECIDEUR`, et l'upload de documents est réservé à `PRESIDENCE`.

## 5.4. Gestion des partenaires — **Implémenté**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Enregistrer ses propres partenaires et mettre à jour leurs informations | Oui | `POST /api/partenaires`, `PATCH /api/partenaires/:id` (rôles `PRESIDENCE`, `ETABLISSEMENT`) |
| Recherche de partenaire existant avant création | Oui | `GET /api/partenaires/recherche-doublon` (tous rôles authentifiés) |
| Caractéristiques : nom, logo, type, pays, adresse, coordonnées, site web, description, statut, visibilité, partenaire stratégique | Oui, **sauf le logo** | Les champs `nom` (unique par établissement), `type`, `pays`, `adresse`, `telephone`, `email`, `site_web`, `description`, `statut`, `visibilite`, `est_strategique` sont gérés. La colonne `logo_url` existe mais **aucun endpoint ni formulaire ne permet de téléverser un logo de partenaire** ; le DTO de création déclare seulement un champ `logo` non utilisé par le service |
| Contacts associés : nom, fonction, e-mail, téléphone | Oui | `POST /api/partenaires/:partenaireId/contacts`, `PATCH /api/contacts/:id`, `DELETE /api/contacts/:id` |
| Un partenaire peut participer à plusieurs partenariats, cotutelles et projets | Oui | Tables `PartenariatPartenaire`, `ProjetPartenaire`, `CotutelleThese.partenaire_id` |

**Règles de gestion implémentées non écrites en v4** :

- Un partenaire ne peut pas avoir deux fois le même nom **au sein du même établissement** : la création renvoie HTTP 409 (`partenaires.service.ts`). **À PRÉCISER** : la règle d'unicité souhaitée au niveau de l'Université entière (deux établissements peuvent actuellement enregistrer deux fiches portant le même nom).
- Aucun contrôle d'association n'est effectué avant l'archivage d'un partenaire (le service renvoie à une vérification par clé étrangère, commentaire explicite dans le code).
- La réponse renvoyée par les endpoints partenaires est l'entité brute (aucun DTO de réponse appliqué) : les colonnes internes (`etablissement_id`, `created_at`, `updated_at`) sont exposées, et le fichier `contacts/dto/contact-response.dto.ts` est vide — limitation déjà consignée dans `SUIVI_TECHNIQUES.md`.

## 5.5. Gestion des partenariats — **Implémenté, avec un circuit de validation non prévu en v4**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Entité distincte du partenaire, entre un ou plusieurs établissements et un ou plusieurs partenaires | Oui | `POST /api/partenariats` avec `etablissements_ids` et `partenaires_ids` obligatoires |
| Intitulé, objet, domaine, dates, statut | Oui | Champs du DTO de création |
| Six champs de suivi narratif (actions réalisées, en cours, prévues, résultats, difficultés, perspectives) | Oui | Colonnes homonymes et onglet de saisie (`PartenariatChampsGeneraux.tsx`, `lib/champs-suivi.ts`) |
| Gestion des partenaires et partenariats regroupée dans une même interface | Oui | Entrée de menu « Partenaires & Partenariats » regroupant deux sous-pages (`SidebarInterne.tsx`) et assistant de création multi-étapes (`PartenariatWizard.tsx`) |
| Un partenariat peut comporter plusieurs projets ; un projet est rattaché à un seul partenariat au plus (RG18) | Oui | `Projet.partenariat_id` nullable ; l'archivage d'un partenariat est refusé s'il compte des projets actifs (statuts autres que `TERMINE` et `EXPIRE`) |
| Un partenariat peut concerner plusieurs établissements (RG17) | Oui, mais un compte Établissement **doit** figurer dans la liste des établissements associés, sinon la création est refusée (HTTP 400) | `partenariats.controller.ts` |

**Circuit de validation (ajout v5)** : le module implémente une logique de statut qui n'apparaît pas dans le document v4 :

1. Un partenariat est créé au statut `BROUILLON` (statut par défaut).
2. `POST /api/partenariats/:id/soumettre` fait passer le statut à `EN_ATTENTE` (**uniquement** depuis `BROUILLON`, sinon HTTP 409) et émet l'événement `partenariat.soumis`.
3. Un membre de l'équipe Projet et Partenariat peut modifier un partenariat quel que soit son statut ; un compte Établissement ne peut le modifier qu'au statut `BROUILLON` (sinon HTTP 403).
4. Seule la Présidence peut archiver un partenariat (`POST /api/partenariats/:id/archiver`).

**Limites constatées** :

- La liste des établissements et des partenaires associés **n'est pas modifiable** après création : `PATCH /api/partenariats/:id` ne traite que les champs scalaires, pas `etablissements_ids` ni `partenaires_ids`. La version 4 §5.3 demande pourtant que l'établissement puisse « ajouter ou modifier » ses partenariats.
- Aucun statut `EN_COURS`, `SUSPENDU` ou `TERMINE` n'est attribué automatiquement par le code : le passage à ces statuts dépend d'une mise à jour manuelle via `PATCH`, sans règle de transition vérifiée.
- Le front-end n'envoie `etablissements_ids` que si la liste n'est pas vide (`construire-payload.ts`), alors que le back-end exige ce champ : la création par un compte Présidence sans sélection d'établissement échoue en validation.

## 5.6. Gestion des cotutelles de thèses — **Implémenté, réservé à la Présidence**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Établissement malgache, université partenaire, doctorant, spécialité, directeurs, type, dates, financement, mobilité, publications, avancement, difficultés, perspectives | Oui, l'ensemble de ces champs existe | Table `CotutelleThese`, DTO de création et de modification |
| Type « Co-tutelle / Co-encadrement » | Oui | Énumération `TypeCotutelle` |
| Une cotutelle peut être associée à une convention | Oui | `CotutelleThese.convention_id` (nullable) ; à la création d'une convention, le champ peut être renseigné via `cotutelle_id` |
| Gestion complète par la Présidence (v4 §12) | Oui | `POST`, `PATCH`, `POST .../archiver` réservés à `PRESIDENCE` |
| Consultation par le Décideur (v4 §12) | Oui | `GET /api/cotutelles`, `GET /api/cotutelles/:id` |
| Consultation par l'Établissement (v4 §12 : « Consultation ») | **Non** : les routes de lecture sont réservées à `PRESIDENCE` et `DECIDEUR`. Le front-end expose pourtant des routes `/etablissement/cotutelles` : un compte Établissement reçoit HTTP 403 sur cet écran | `cotutelles.controller.ts` |

## 5.7. Gestion des projets — **Implémenté, avec un circuit de validation non prévu en v4**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Nom et intitulé officiel distincts (RG08) | Oui | Deux colonnes distinctes, `intitule_officiel` nullable |
| Type ou domaine, budget total, dates, statut | Oui | Champs `type`, `domaine`, `budget`, `date_debut`, `date_fin_prevue`, `statut` |
| Établissement responsable | Oui | `etablissement_id` imposé par le compte connecté (ou choisi par la Présidence) |
| Partenariat concerné, facultatif | Oui | `partenariat_id` nullable |
| Porteur | Oui | `porteur_id` nullable, table `Porteur` |
| Un ou plusieurs bailleurs | Oui | Table `ProjetBailleur` |
| Partenaires propres en complément ou en l'absence de partenariat | Oui | Table `ProjetPartenaire` |
| Bénéficiaires multiples | Oui | Table `ProjetBeneficiaire` |
| Sites multiples | Oui | Table `ProjetSite` |
| Activités, avancement, chronogramme | **Absent au niveau applicatif** : les tables existent mais aucun endpoint ni écran ne les expose (voir §5.8) | — |
| Convention et publication éventuelles | Oui | `Document`, `Convention.projet_id`, `Publication.projet_id` (unique) |
| Identification du retard et notification (v4 §5.7 et RG40) | Oui | Champ calculé `en_retard` dans la réponse projet ; règle quotidienne `ProjetRetardRule` |

**Circuit de validation et d'archivage (ajout v5)** :

1. Création au statut `BROUILLON` par la Présidence ou l'Établissement.
2. `PATCH /api/projets/:id` n'est autorisé que tant que le projet est en `BROUILLON` (HTTP 403 sinon) — **cette restriction n'existe pas dans la version 4**.
3. `POST /api/projets/:id/soumettre` fait passer le statut à `EN_ATTENTE` depuis `BROUILLON` uniquement (HTTP 409 sinon) et émet `projet.soumis`.
4. `POST /api/projets/:id/archiver` (Présidence uniquement) est refusé si le projet compte des activités non terminées, sauf si le projet est déjà `TERMINE`.
5. Le calcul du retard exclut les statuts `BROUILLON`, `TERMINE` et `EXPIRE`.

**Limites constatées** :

- Comme pour les partenariats, les listes associées au projet (partenaires, bénéficiaires, bailleurs, sites) ne peuvent pas être modifiées après création : `PATCH /api/projets/:id` n'accepte que les champs scalaires.
- Aucun passage automatique vers `EN_COURS` n'est implémenté : le statut reste à la valeur saisie.
- Le champ `budget` est un `numeric(12,2)` sans devise associée. **À PRÉCISER** : la devise de référence (ariary, euro, dollar) n'est ni imposée ni enregistrée.

## 5.8. Gestion des activités, de l'avancement et du chronogramme — **Absent au niveau applicatif**

C'est l'écart le plus important entre le document de référence et le code.

| Spécifié en v4 | État constaté |
|---|---|
| §5.12 — Chaque projet est décomposé en plusieurs activités (intitulé + état terminé) permettant le calcul automatique de l'avancement | **Absent** : le dossier `backend/src/activites/` contient 11 fichiers (contrôleur, service, module, DTO d'activité, sous-module `chronogramme`) qui sont **tous vides (0 octet)**. Aucun contrôleur n'expose de route `/activites` ou `/chronogramme` |
| §5.13 — Chronogramme : année, trimestre, mois, nombre de jours par activité | **Absent** : l'entité `Chronogramme` (avec sa contrainte d'unicité) a été créée et migrée, mais aucun service ne la lit ni ne l'écrit |
| RG11, RG12 — plusieurs activités par projet, plusieurs entrées de chronogramme par activité | **Schéma conforme**, comportement applicatif absent |
| RG13 — avancement calculé automatiquement à partir des activités terminées | **Partiellement implémenté** : la formule existe (`Math.round(activites_terminees / activites_totales * 100)`) dans `projets.service.ts` (`enrichir`, `getAvancement`) et `projets/avancement.service.ts`, et est exposée par `GET /api/projets/:id/avancement` et par le champ `avancement` de chaque projet. Mais comme aucune activité ne peut être créée ni cochée via l'API, l'avancement est figé sur les données du jeu de démonstration |
| §5.12 — Échéance d'activité et retard d'activité | **Absent** : la colonne `date_echeance` existe ; le fichier `notifications/rules/activite-retard.rule.ts` est **vide**, aucun type `ACTIVITE_RETARD` n'est émis |
| Tableau de bord « activité mensuelle » côté interface | **Partiel** : le composant et le graphique existent, mais l'appel `GET /api/tableau-de-bord/activite-mensuelle` n'a **pas de route côté back-end** ; le code prévoit explicitement ce cas et affiche un état vide (« Les données d'activité mensuelle seront disponibles prochainement ») |
| Interface de saisie des activités et du chronogramme | **Absente** : la fiche projet du front-end ne comporte que deux onglets, « Informations » et « Documents ». Les fichiers `useAvancement.ts` et `IndicateurAvancement.tsx` existent mais **ne sont importés par aucun écran** |

**Conséquence à acter** : les objectifs de la version 4 concernant le suivi des activités en nombre de jours par mois et par trimestre (pratique actuelle de l'équipe) **ne sont pas couverts** par l'état actuel du logiciel. La règle « le suivi en jours est indépendant du calcul automatique d'avancement » (§5.13) est donc sans objet pour l'instant.

## 5.9. Gestion des documents — **Implémenté, réservé à la Présidence**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Documents rattachés à un projet ou à une convention (TDR, description, convention) | Oui | `POST /api/documents` avec `projet_id` **ou** `convention_id` obligatoire (HTTP 400 sinon), `type` parmi `TDR`, `DESCRIPTION`, `CONVENTION`, `AUTRE` |
| Conservation de l'ancienne version lors d'un remplacement (RG24) | Oui | Au téléversement, le document non archivé de même type et de même entité passe à `est_archive = true` et la version est incrémentée |
| Téléchargement de chaque version, y compris archivée | Oui | `GET /api/documents/:id/telecharger` et `GET /api/documents/:id/versions` |
| Téléchargement par les utilisateurs autorisés (RG25) | **Restreint** : toutes les routes de documents exigent le rôle `PRESIDENCE`. Un établissement ne peut ni téléverser, ni lister, ni télécharger un document, alors que la version 4 §9.2 prévoit qu'il « gère la convention et téléverse le document lorsqu'il est disponible » et que le tableau §12 lui attribue « Les siens » |
| Suppression | `DELETE /api/documents/:id` (Présidence) supprime réellement le fichier et l'enregistrement — exception à la règle RG26 « l'archivage ne constitue pas une suppression définitive », qui ne s'applique donc qu'aux entités métier |

## 5.10. Gestion et archivage des conventions — **Implémenté, sauf l'étape de circuit**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Entité indépendante associée à un partenariat, un projet ou une cotutelle (RG21) | Oui | `Convention.partenariat_id` et `projet_id` (nullable) + rattachement côté cotutelle ; au moins l'un des trois est exigé à la création (HTTP 400 sinon) |
| Référence, titre, date de signature, date de début, date de fin, statut, description | Oui | Référence unique : doublon refusé en HTTP 409 |
| Statuts : en préparation, en attente de signature, signée, active, suspendue, expirée, archivée | **Partiel** : 6 statuts énumérés + drapeau `archive` (voir §4.4) |
| Circuit de traitement interne : Projet et Partenariat, Secrétaire principale, Direction des Affaires Juridiques, Signature, suivi par une étape mise à jour manuellement (RG22) | **Absent** : pas de colonne, pas d'énumération, pas de DTO, pas d'écran. Les fichiers dédiés sont vides. La fiche convention du front-end n'affiche donc aucune étape de circuit |
| Archivage et téléchargement des conventions signées (RG23) | **Partiel** : l'archivage est implémenté (`POST /api/conventions/:id/archiver`, Présidence) ; le téléchargement se fait par les documents rattachés (§5.9), pas par un endpoint propre à la convention |
| Suivi automatique de la validité et notification avant expiration (RG36) | Oui | Règle `ConventionExpirationRule`, seuils 30 / 15 / 7 jours |
| Marquage automatique comme expirée (RG37) | Oui | Règle `ConventionExpireeRule` : passage du statut à `EXPIREE` puis notification |
| Gestion complète par la Présidence (v4 §12) | Oui | Création, modification, archivage réservés à `PRESIDENCE` |
| Consultation par l'Établissement et le Décideur (v4 §12) | **Partiel** : le Décideur peut lire ; l'Établissement **non** (`GET /api/conventions` exige `PRESIDENCE` ou `DECIDEUR`) |

## 5.11. Archivage — **Implémenté, enrichi d'une restauration**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Archivage des partenaires, partenariats, projets, cotutelles et conventions non actifs | Oui | Drapeau `archive` ; `POST /api/<ressource>/:id/archiver`. Réservé à la Présidence, **sauf** la restauration, ouverte aussi aux établissements |
| Archivage des anciennes versions de documents | Oui | `Document.est_archive` |
| Accès global aux archives pour la Présidence, accès limité aux siennes pour un établissement (v4 §5.16) | Oui | `GET /api/archives/{partenaires,partenariats,projets,conventions,cotutelles,documents}` filtre par établissement pour le rôle `ÉTABLISSEMENT` ; `GET /api/archives/:type/:id` contrôle également le cloisonnement |
| Archivage ≠ suppression définitive (RG26) | Oui pour les six types listés : restauration possible via `POST /api/archives/:type/:id/restaurer` (**ajout v5**, non prévu en v4) |

**Préconditions d'archivage implémentées (ajout v5)** : un partenariat comptant des projets non terminés ne peut pas être archivé ; un projet comptant des activités non terminées ne peut pas être archivé, sauf s'il est déjà `TERMINE`.

## 5.12. Gestion des logos — **Partiel**

| Spécifié en v4 | Implémenté |
|---|---|
| Chaque établissement et chaque partenaire possède un logo, affiché dans les fiches, listes et publications publiques (RG27) | Les colonnes `logo_url` existent sur `Etablissement` et `Partenaire`, et les DTO publics les exposent. **Aucun endpoint ni formulaire de téléversement de logo n'existe** (le champ `logo` du DTO partenaire est déclaré mais non traité par le service). Les logos ne peuvent donc être renseignés que directement en base |
| Logo officiel de l'Université, élément fixe de l'identité visuelle, utilisé par l'équipe Projet et Partenariat | Le front-end embarque une image d'accueil (`frontend/src/assets/hero.png`) et des jetons de couleurs institutionnels (`src/styles/design-tokens-uf.css` : vert `#047857`, or `#FFC400`, typographies Plus Jakarta Sans / Inter / JetBrains Mono). **À PRÉCISER** : aucun fichier de logo officiel de l'Université n'est présent dans le dépôt, et la vitrine publique ne référence pas de logo institutionnel |

## 5.13. Gestion des publications — **Implémenté, réservé à la Présidence**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Entité séparée du projet | Oui | Table `Publication`, texte long `description_publique` séparé des données de gestion |
| Titre, description publique, date de publication, statut (Brouillon / Publiée), résultats | Oui | `StatutPublication` ; passage à `PUBLIEE` par `PATCH /api/publications/:id/publier` |
| Plusieurs photos avec légende et ordre facultatifs | Oui | `POST /api/publications/:publicationId/photos`, `GET`, `DELETE /api/photos/:id` ; réordonnancement côté interface (`GaleriePhotosReordonnable.tsx`) |
| Établissement concerné, partenaires, bénéficiaires de la publication | **Non stockés sur la publication** : la table `Publication` ne porte qu'un `projet_id`. Ces informations ne peuvent être affichées qu'en dérivé du projet, or l'API publique `GET /api/public/publications` ne renvoie que `titre`, `description_publique`, `date_publication`, `resultats`, `projet_id` et les photos |
| Un projet peut faire l'objet d'une publication (RG29 : au plus une) | Oui | Colonne `projet_id` unique + contrôle `ConflictException` |
| Gestion complète par la Présidence (v4 §12) | Oui |
| Les siens pour l'établissement (v4 §12) et « éventuellement » pour le Décideur | **Absent** : les routes de publications sont `PRESIDENCE` (écriture et liste) et `PRESIDENCE`/`DECIDEUR` (lecture). Le front-end n'expose aucune route de publication pour `/etablissement` |

## 5.14. Recherche et filtrage — **Implémenté**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Recherche rapide des partenaires, partenariats, cotutelles, projets, conventions et archives | **Partiellement** | `GET /api/recherche?q=&type=` couvre partenaires, partenariats, projets, conventions et cotutelles (5 types, 20 résultats maximum par type, pagination appliquée après agrégation). **Les archives ne sont pas incluses** dans la recherche transverse ; elles disposent de leurs propres listes filtrées |
| Projets filtrables par établissement, partenaire, partenariat, type, statut, période et avancement | **Partiellement** | `QueryProjetDto` accepte `nom`, `type`, `statut`, `etablissement_id`, `partenariat_id`, `partenaire_id`, `date_debut_from`, `date_debut_to`, `archive`. Les paramètres `date_debut_from`/`date_debut_to` sont **déclarés mais non appliqués** dans la requête du service ; le filtrage par avancement n'existe pas |
| Conventions filtrables par partenaire, partenariat, projet, statut, période et date d'expiration | **Partiellement** | `QueryConventionDto` accepte `reference`, `titre`, `statut`, `partenariat_id`, `projet_id`, `date_fin_from`, `date_fin_to`, `archive`. Le filtrage par partenaire ou par projet **en tant que critère indirect** (conventions d'un partenaire) n'est pas exposé |
| Écrans de recherche | Oui, mais seulement pour la Présidence | `/presidence/recherche` (`RecherchePage.tsx`) ; pas de route `/etablissement/recherche` ni `/decideur/recherche` alors que l'API autorise les trois rôles |

## 5.15. Tableau de bord et synthèse annuelle — **Implémenté**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Tableau de bord adapté à chaque rôle interne | Oui | Trois pages distinctes : `TableauDeBordPresidence`, `TableauDeBordEtablissement`, `TableauDeBordDecideur` |
| Vision globale pour l'équipe Projet et Partenariat : nombre de partenaires, partenariats, cotutelles, projets par statut, conventions actives / expirées / bientôt expirées | Oui | `GET /api/tableau-de-bord` renvoie `compteurs` (partenaires, partenariats, cotutelles, projets, conventions, publications, répartition des conventions par statut), `projets_par_statut`, `conventions_par_statut` (actives, expirées, bientôt expirées à 30 jours, en attente de signature) et le périmètre (`GLOBAL` ou `ETABLISSEMENT`) |
| Tableau de bord d'un établissement limité à ses propres données | Oui | Même endpoint : le filtre d'établissement est appliqué pour le rôle `ETABLISSEMENT` |
| Tableau de bord du Décideur privilégiant les indicateurs globaux | Oui, enrichi d'un comparatif par établissement (`GET /api/statistiques/comparatif-etablissements`, Présidence et Décideur) |
| Échéancier : conventions bientôt expirées et projets en retard | Oui (**ajout v5**) | `GET /api/tableau-de-bord/echeancier` : conventions signées/actives expirant sous 30 jours avec nombre de jours restants, et projets en retard avec nombre de jours de retard (50 lignes maximum par catégorie) |
| Synthèse nationale annuelle générée automatiquement par établissement (RG44) | Oui | `GET /api/synthese?annee=`, `GET /api/synthese/:etablissementId?annee=` |
| Compteurs calculés : nombre de partenaires, conventions actives/expirées, cotutelles, projets actifs | Oui | Les « projets actifs » correspondent aux statuts `EN_COURS` et `EN_ATTENTE` ; les conventions actives aux statuts `ACTIVE` et `SIGNEE` ; les conventions rattachées sont comptées par projet **ou** par partenariat de l'établissement |
| Éléments narratifs saisis par l'équipe : domaines principaux, partenaires stratégiques, défis majeurs, priorités futures | Oui | `POST /api/synthese/items` (types `DOMAINE_PRINCIPAL`, `DEFI_MAJEUR`, `PRIORITE_FUTURE`, un par établissement et par année) et `POST /api/synthese/partenaires-strategiques` (sélection parmi les partenaires existants) |
| Consultation par le Décideur | Oui |
| Génération par l'établissement | **Non prévu par le code** : `GET /api/synthese*` est réservé à `PRESIDENCE` et `DECIDEUR` ; le front-end n'expose pas de route de synthèse pour `/etablissement` |

**Limites constatées** : la synthèse n'est disponible qu'en consultation écran ; **aucun export ni téléchargement** de la synthèse annuelle (PDF ou Excel) n'est implémenté, alors que la version 4 insiste sur le remplacement du fichier `Synthese_national` produit à la main.

## 5.16. Notifications — **Partiellement implémenté**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Notification à l'ajout d'un nouveau partenaire, partenariat ou projet par un établissement (RG34) | **Partiel** | Seule la **soumission** déclenche une notification : événements `projet.soumis` et `partenariat.soumis` traités par `SoumissionListener` (destinataires : tous les utilisateurs `PRESIDENCE` actifs, priorité haute). La **création** d'un projet, d'un partenariat ou d'un partenaire sans soumission ne notifie personne ; aucun événement n'existe pour l'ajout d'un partenaire |
| Notification lors d'une modification importante (RG35) | **Absent** | Aucun événement de modification n'est émis |
| Alerte avant expiration de convention, seuils 30 / 15 / 7 jours (RG36) | Oui | `ConventionExpirationRule`, exécutée chaque jour à 06 h 00 ; le seuil retenu est le plus proche atteint (30, sinon 15, sinon 7) ; statuts `SIGNEE` et `ACTIVE` ; destinataires : Présidence (priorité haute) et établissement propriétaire du projet rattaché s'il existe ; anti-répétition de 30 jours |
| Alerte de convention expirée (RG37) | Oui | `ConventionExpireeRule` : statut passé à `EXPIREE`, notification Présidence + établissement, anti-répétition 30 jours |
| Alerte d'échéance proche d'une activité (RG38) | **Absent** | Aucune règle |
| Alerte d'activité en retard (RG39) | **Absent** | `activite-retard.rule.ts` est vide ; le type `ACTIVITE_RETARD` existe dans l'énumération mais n'est jamais émis |
| Alerte de projet en retard (RG40) | Oui | `ProjetRetardRule` : projets non `BROUILLON`, `TERMINE` ou `EXPIRE` dont la date de fin prévue est dépassée ; Présidence en priorité haute, établissement en priorité moyenne ; anti-répétition 7 jours |
| État lu / non lu (RG41) | Oui | `PATCH /api/notifications/:id/lue`, `PATCH /api/notifications/tout-marquer-lu`, `GET /api/notifications/non-lues/count` |
| Association à l'utilisateur ou au groupe concerné (RG42) | **Partiel** (voir §4.4) |
| Vérification périodique quotidienne (RG43) | Oui | `@Cron(EVERY_DAY_AT_6AM)` exécutant les trois règles ; seules trois règles sur cinq sont présentes |
| Espace dédié et accès direct à l'élément concerné | Oui | Page `/presidence/notifications` et `/etablissement/notifications`, tiroir de notifications dans la barre supérieure, compteur de non-lues, rafraîchissement automatique toutes les 45 secondes lorsque l'onglet est visible (`useNotificationsPolling.ts`), `reference_type` + `reference_id` pour le lien vers la fiche |

**Types de notification déclarés mais jamais émis** : `ACTIVITE_ECHEANCE`, `ACTIVITE_RETARD`, `DOCUMENT_AJOUTE`, `DOCUMENT_MODIFIE`, `CHANGEMENT_STATUT`. Le fichier `notifications/listeners/document.listener.ts` est **vide** (0 octet).

## 5.17. Espace public — **Implémenté**

| Spécifié en v4 | Implémenté | Détail |
|---|---|---|
| Rubriques : Accueil, À propos, Établissements, Partenaires, Projets et Partenariats, Contact | Oui, les six rubriques existent | Routes front-end `/`, `/a-propos`, `/etablissements`, `/partenaires`, `/projets-partenariats`, `/projets-partenariats/publication/:id`, `/contact` |
| Publications au statut « Publiée » uniquement (RG30) | Oui | `GET /api/public/publications` et `/public/publications/:id` filtrent `statut = PUBLIEE` |
| Informations non confidentielles des établissements et partenaires | Oui | `GET /api/public/etablissements` (nom, sigle, logo, description), `GET /api/public/partenaires` (partenaires au statut `visibilite = PUBLIC` et non archivés : nom, type, pays, description, logo, site web). Les coordonnées (adresse, téléphone, e-mail) d'un partenaire **ne sont pas** publiées |
| Statistiques publiques sur la page d'accueil | Oui | `GET /api/public/accueil` : nombre de partenaires actifs publics, de projets en cours (`EN_COURS` ou `EN_ATTENTE`) et de conventions signées ou actives, plus les 5 dernières publications |
| Formulaire de contact | **Partiel** | L'écran de contact et le DTO `ContactPublicDto` existent, mais **aucune route back-end** ne les relie : l'appel `POST /api/public/contact` du front-end ne correspond à aucun contrôleur (HTTP 404). Le commentaire du DTO indique que « les messages sont persistés pour un traitement ultérieur », mais aucune table ni aucun service de persistance des messages n'existe |
| Mise en page publique | Oui | Barre supérieure publique, pied de page, carrousel, sections « Établissements » et « Partenaires », animations d'apparition | 

## 5.18. Export de données — **Ajout v5 (non prévu en version 4)**

| Élément | Constat |
|---|---|
| Service d'export | `ExportService` génère des tableaux PDF (via `pdfkit`) et Excel (via `exceljs`), format en paysage A4 avec en-têtes stylés |
| Endpoints | `GET /api/export/projets?format=pdf|xlsx` et `GET /api/export/conventions?format=pdf|xlsx`, rôles `PRESIDENCE` et `DECIDEUR` ; format par défaut : `pdf` ; format invalide : HTTP 400 |
| Colonnes exportées | Projets : nom, type, statut, date de début, date de fin, budget, établissement. Conventions : référence, titre, statut, date de début, date de fin, partenariat |
| Portée | Pour un compte Établissement, la portée serait filtrée, mais la route est réservée à la Présidence et au Décideur |
| Interface | **Incohérence fonctionnelle** : la page `/presidence/export` affiche « Fonctionnalité bientôt disponible » et les composants `ExportButton` / `ExportModal` ne sont importés par aucun écran. L'export est donc utilisable seulement par appel direct à l'API |

## 5.19. Référentiels (bailleurs, bénéficiaires, porteurs, sites) — **Ajout v5**

| Élément | Constat |
|---|---|
| Modules | `backend/src/referentiels/` : `bailleurs`, `beneficiaires`, `porteurs`, `sites`, un contrôleur/service/DTO par référentiel |
| Endpoints | `GET/POST/PATCH/DELETE /api/referentiels/{bailleurs,beneficiaires,porteurs,sites}` ; lecture ouverte aux trois rôles internes, écriture réservée à `PRESIDENCE` |
| Écran | `/presidence/referentiels` (`ReferentielsPage.tsx`) avec création, modification et suppression en ligne |
| Cohérence avec la v4 | La version 4 prévoyait une gestion des porteurs (§5.8), des bailleurs (§5.9), des bénéficiaires (§5.10) et des sites (§5.11) **sans préciser qui les crée**. L'implémentation réserve la création à la Présidence : un établissement ne peut que les sélectionner dans ses projets. **À PRÉCISER** : ce point est une décision d'implémentation à valider par l'équipe (les établissements doivent-ils créer leurs propres sites et porteurs ?) |
| Suppression | `DELETE` supprime réellement l'enregistrement ; les clés étrangères protègent les référentiels utilisés (erreur `23503` traduite en HTTP 409) |

## 5.20. Compte utilisateur et changement de mot de passe — **Absent côté API**

| Élément | Constat |
|---|---|
| Écran « Paramètres du compte » | Présent pour les trois rôles (`/presidence/parametres`, `/etablissement/parametres`, `/decideur/parametres` → `ParametresCompte.tsx`), avec formulaire de changement de mot de passe et validations (`lib/validators/compte.schema.ts`, `ReglesMotDePasse.tsx`) |
| Endpoints appelés par l'écran | `GET /api/compte` et `PATCH /api/compte/mot-de-passe` (`useCompte.ts`, `useChangerMotDePasse.ts`) |
| Côté back-end | **Aucune route** : le module `backend/src/utilisateurs/` (module, contrôleur, service, DTO `update-mot-de-passe.dto.ts`, `utilisateur-response.dto.ts`) est **entièrement vide** et n'est pas importé par `AppModule`. Les deux appels renvoient donc HTTP 404 |
| Contournement existant | La réinitialisation du mot de passe par e-mail fonctionne (`/mot-de-passe-oublie` puis `/reset-password`) |

## 5.21. Maintenance et cohérence des fichiers — **Ajout v5**

| Élément | Constat |
|---|---|
| Contrôle de santé | `GET /api/health` (public) : état du service, durée de fonctionnement, état de la base |
| Nettoyage des fichiers orphelins | Service + tâche planifiée (04 h 00) + déclenchement manuel `POST /api/maintenance/nettoyage` (Présidence) ; délai de grâce de 24 heures |
| Purge des jetons | Tâche planifiée (03 h 00) supprimant les jetons de rafraîchissement expirés ou révoqués depuis plus de 30 jours |
| Journalisation | Intercepteur de journalisation des requêtes HTTP (`common/interceptors/logging.interceptor.ts`) et journalisation des erreurs inattendues et des codes PostgreSQL non traduits |
| Outils de vérification | `backend/scripts/generer-migration-initiale.ts` (régénération/mesure de dérive du schéma), `verifier-migrations.ts` (application sur base vierge), `serveur-pglite.ts` (PostgreSQL en mémoire hors Docker) |

## 5.22. Rappel des principes d'ergonomie (v4 §11.1) — **Respectés**

- Les relations complexes sont masquées : composants de sélection à cases à cocher (`ChecklistSelection.tsx` et les six composants `Selection*.tsx`).
- Partenaires et partenariats sont regroupés sous une seule entrée de menu.
- Les formulaires longs (projet, partenariat) sont découpés en assistants multi-étapes (`components/forms/wizard/Wizard.tsx`, `ProjetWizard.tsx`, `PartenariatWizard.tsx`) avec brouillon conservé (`useWizardDraft.ts`).
- Les listes disposent de filtres à facettes, de puces de filtre, de pagination et d'états vides explicites (`FacetedFilters.tsx`, `FilterChips.tsx`, `TablePagination.tsx`, `EmptyState.tsx`).
- Les statuts sont présentés avec un libellé et une couleur cohérents (`lib/status-mappings.ts`, `StatusBadge.tsx`).
- L'accessibilité de base est prise en charge par les composants Radix (rôles, focus) ; un bandeau d'erreur global (`ErrorBoundary`) et une page 403 (`ForbiddenPage`) sont prévus.

---

# 6. Règles de gestion RG01 à RG44 : texte de référence et état d'implémentation

Le texte des règles est celui de la version 4 (§6). La colonne « État » résulte de la lecture du code au commit `c1b5dae`.

| Code | Règle de gestion (texte v4) | État dans l'implémentation |
|---|---|---|
| RG01 | La Présidence dispose d'un compte unique utilisé par l'équipe Projet et Partenariat. | **Partiel** — plusieurs comptes Présidence sont acceptés (aucune contrainte d'unicité) ; cf. §2.2 |
| RG02 | Chaque établissement dispose d'un compte unique, associé à un seul établissement. | **Partiel** — `Utilisateur.etablissement_id` existe mais rien n'impose l'unicité ; cf. §2.2 |
| RG03 | Un ou plusieurs comptes Décideur peuvent exister, non rattachés à un établissement. | **Conforme** — rôle `DECIDEUR`, `etablissement_id` nullable |
| RG04 | Le visiteur peut accéder aux informations publiques sans compte. | **Conforme** — routes `@Public()` sous `/api/public/*` |
| RG05 | Un établissement ne peut ajouter, consulter et modifier que ses propres informations, depuis son espace de gestion dédié. | **Conforme pour les domaines ouverts à l'établissement** — filtres `etablissement_id` + `OwnEtablissementGuard` ; les autres domaines lui sont totalement fermés (§5.9, §5.10, §5.13) |
| RG06 | Les informations ajoutées par un établissement sont automatiquement rattachées à celui-ci. | **Conforme** — l'identifiant est imposé depuis le jeton JWT |
| RG07 | L'équipe Projet et Partenariat dispose d'une vision globale de toutes les informations enregistrées. | **Conforme** — aucun filtre d'établissement appliqué au rôle `PRESIDENCE` |
| RG08 | Le nom et l'intitulé officiel d'un projet sont deux informations distinctes. | **Conforme** — deux colonnes, `intitule_officiel` nullable |
| RG09 | Le budget, le type et le statut sont des attributs du projet. | **Conforme** — colonnes `budget`, `type`, `statut` |
| RG10 | Le porteur représente la personne responsable d'un projet. | **Conforme** — table `Porteur`, `Projet.porteur_id` |
| RG11 | Un projet peut comporter plusieurs activités ; une activité appartient à un seul projet. | **Schéma conforme, application absente** — l'entité `Activite` porte `projet_id`, mais aucune route ne crée d'activité (§5.8) |
| RG12 | Une activité peut posséder plusieurs entrées de chronogramme (suivi en jours par mois). | **Schéma conforme, application absente** — table `Chronogramme` migrée, aucun endpoint (§5.8) |
| RG13 | L'avancement d'un projet est calculé automatiquement à partir des activités terminées, indépendamment du chronogramme. | **Calcul conforme, données non alimentables** — `GET /api/projets/:id/avancement`, arrondi à l'entier ; avancement figé faute de gestion des activités |
| RG14 | Un projet peut être associé à un ou plusieurs sites ; un site peut être associé à plusieurs projets. | **Conforme** — table `ProjetSite` |
| RG15 | Un projet peut être associé à plusieurs bénéficiaires ; un bénéficiaire peut être associé à plusieurs projets. | **Conforme** — table `ProjetBeneficiaire` |
| RG16 | Un partenaire est rattaché à un établissement et peut participer à plusieurs partenariats, cotutelles et projets. | **Conforme** — `Partenaire.etablissement_id` + trois relations d'association |
| RG17 | Un partenariat peut concerner un ou plusieurs établissements et un ou plusieurs partenaires. | **Conforme** — `PartenariatEtablissement`, `PartenariatPartenaire` |
| RG18 | Un partenariat peut comporter plusieurs projets ; un projet n'est rattaché qu'à un seul partenariat au plus, ou à aucun. | **Conforme** — `Projet.partenariat_id` nullable (relation plusieurs-à-un) |
| RG19 | Un projet peut posséder ses propres partenaires, en complément ou en l'absence de partenariat. | **Conforme** — table `ProjetPartenaire` |
| RG20 | Une cotutelle de thèse est associée à un établissement malgache et à un partenaire (université partenaire). | **Conforme** — deux clés étrangères obligatoires |
| RG21 | Une convention est associée à un partenariat, un projet ou une cotutelle de thèse selon le contexte. | **Conforme** — au moins une des trois associations exigée à la création ; une convention peut toutefois être liée à plusieurs cotutelles |
| RG22 | L'étape du circuit de traitement d'une convention est mise à jour manuellement par l'équipe Projet et Partenariat, hors plateforme. | **Non implémenté** — aucune donnée d'étape de circuit (§5.10, §4.4) |
| RG23 | Les conventions signées doivent pouvoir être archivées et téléchargées. | **Partiel** — archivage implémenté ; téléchargement indirect via les documents, eux-mêmes réservés à la Présidence |
| RG24 | Une ancienne version d'un document n'est pas supprimée lors du téléversement d'une nouvelle, et reste elle-même téléchargeable. | **Conforme** — `est_archive = true` + incrément de `version` + `GET /api/documents/:id/versions` |
| RG25 | Un document peut être rattaché directement à un projet ou à une convention, et doit pouvoir être téléchargé par les utilisateurs autorisés. | **Partiel** — rattachement conforme ; accès limité au rôle `PRESIDENCE` |
| RG26 | L'archivage ne constitue pas une suppression définitive. | **Conforme pour les entités métier** (restauration possible) ; **exception** : `DELETE /api/documents/:id` et `DELETE /api/photos/:id` suppriment réellement |
| RG27 | Chaque établissement et chaque partenaire possède un logo. | **Partiel** — colonnes `logo_url` présentes, aucun moyen de téléverser un logo via l'application (§5.12) |
| RG28 | Un contact est rattaché à un seul partenaire. | **Conforme** — `Contact.partenaire_id` obligatoire |
| RG29 | Un projet peut être associé à au plus une publication ; une publication peut posséder plusieurs photos. | **Conforme** — `Publication.projet_id` unique + contrôle applicatif |
| RG30 | Seule une publication au statut « Publiée » est visible par le visiteur. | **Conforme** — filtres `statut = PUBLIEE` sur les routes publiques |
| RG31 | Les informations publiques sont séparées des informations internes ou confidentielles. | **Conforme pour les partenaires et publications** (visibilité `PUBLIC`, statut `PUBLIEE`) ; **à préciser** : aucun mécanisme de publication des projets ou conventions n'existe, donc la séparation se limite à ces deux périmètres |
| RG32 | Le Décideur dispose d'un accès en lecture seule aux indicateurs agrégés et au détail des fiches. | **Conforme** — rôles de lecture uniquement ; l'interface annonce explicitement le mode « lecture seule » |
| RG33 | La gestion administrative des établissements ne fait pas partie du rôle de l'équipe Projet et Partenariat. | **Conforme** — lecture seule via l'API |
| RG34 | Une notification est générée lorsqu'un établissement ajoute un nouveau partenaire, un nouveau partenariat ou un nouveau projet. | **Partiel** — notification à la soumission de projet/partenariat seulement ; aucun événement pour l'ajout d'un partenaire ni pour une création non soumise (§5.16) |
| RG35 | Une notification peut être générée lorsqu'une modification importante est effectuée sur une information suivie par l'équipe Projet et Partenariat. | **Non implémenté** — aucun événement de modification |
| RG36 | Le système génère automatiquement une notification lorsqu'une convention approche de sa date d'expiration (plusieurs seuils possibles, par exemple 30, 15 ou 7 jours avant échéance). | **Conforme** — seuils 30/15/7, tâche quotidienne à 06 h 00 |
| RG37 | Le système génère automatiquement une notification lorsque la date de fin de validité d'une convention est dépassée. | **Conforme, avec effet de bord** — la convention passe au statut `EXPIREE` puis notifie |
| RG38 | Une notification peut être générée lorsqu'une activité approche de son échéance. | **Non implémenté** |
| RG39 | Le système génère automatiquement une notification lorsqu'une activité dépasse son échéance sans être marquée comme terminée. | **Non implémenté** — fichier de règle vide |
| RG40 | Le système génère automatiquement une notification lorsqu'un projet dépasse sa date de fin prévue sans être terminé. | **Conforme** — règle quotidienne, anti-répétition 7 jours |
| RG41 | Une notification possède un état indiquant si elle a été lue ou non lue. | **Conforme** — `est_lue`, marquage unitaire et global, compteur de non-lues |
| RG42 | Une notification est associée à l'utilisateur ou au groupe d'utilisateurs concerné. | **Partiel** — association à un utilisateur unique ; diffusion aux utilisateurs actifs du rôle ou de l'établissement concerné, sans entité « groupe » |
| RG43 | Les contrôles relatifs aux conventions, aux activités et aux projets sont exécutés périodiquement par le système (par exemple quotidiennement) afin d'identifier les expirations et les retards. | **Partiel** — tâche quotidienne à 06 h 00 pour conventions et projets ; aucun contrôle pour les activités |
| RG44 | La synthèse annuelle par établissement est calculée automatiquement à partir des données existantes ; seuls les éléments narratifs (domaines, partenaires stratégiques, défis, priorités) sont saisis manuellement. | **Conforme** — compteurs calculés à la demande, éléments narratifs persistés |

## 6.1. Synthèse des règles non satisfaites

| Règle | Nature de l'écart | Conséquence fonctionnelle |
|---|---|---|
| RG11, RG12, RG13, RG38, RG39, RG43 (volet activités) | Les activités et le chronogramme ne sont pas exposés par l'API ni par l'interface | Le suivi mensuel en nombre de jours, la mise à jour de l'avancement par case à cocher et les alertes d'échéance d'activité sont hors service |
| RG22 | L'étape de circuit de traitement des conventions n'est pas modélisée | Le suivi du circuit (Projet et Partenariat, Secrétaire principale, Affaires Juridiques, Signature) reste hors plateforme |
| RG34, RG35 | Les notifications d'ajout ne couvrent que la soumission ; aucune notification de modification | L'équipe Projet et Partenariat n'est pas informée des créations non soumises ni des modifications |
| RG01, RG02, RG42 | Contraintes de gestion des comptes et de diffusion « de groupe » non portées par le schéma | Risque de comptes multiples pour un même établissement ; notifications dupliquées par utilisateur |
| RG05, RG23, RG25, RG27, RG31 | Périmètres plus restreints que ceux décrits dans le tableau de répartition de la version 4 (documents, publications, conventions pour l'établissement ; logos) | Les établissements ne peuvent pas gérer eux-mêmes conventions, documents et publications, contrairement à la version 4 §12 |

---

# 7. Cartographie des modules et des endpoints

## 7.1. Modules du back-end

`AppModule` (`backend/src/app.module.ts`) enregistre les garde-fous globaux suivants : `ThrottlerGuard`, `JwtAuthGuard`, `RolesGuard`, ainsi que l'intercepteur d'enveloppe `ResponseInterceptor` et le filtre `AllExceptionsFilter`. Les modules fonctionnels importés sont :

| Module | Contenu | État |
|---|---|---|
| `AuthModule` | Connexion, rafraîchissement, déconnexion, profil, mot de passe oublié, réinitialisation, purge des jetons | Actif |
| `DatabaseModule` | Connexion TypeORM (pool, entités, migrations) | Actif |
| `EtablissementsModule` | Lecture des établissements | Actif (lecture seule) |
| `PartenairesModule` | Partenaires et contacts | Actif |
| `PartenariatsModule` | Partenariats, associations, soumission, archivage | Actif |
| `ProjetsModule` | Projets, associations, avancement, soumission, archivage | Actif |
| `CotutellesModule` | Cotutelles de thèses | Actif |
| `DocumentsModule` | Téléversement versionné, liste, téléchargement, suppression | Actif |
| `ConventionsModule` | Conventions (création, mise à jour, consultation, archivage) | Actif ; le service d'étape de circuit est vide |
| `PublicationsModule` (+ `photos`) | Publications et photos | Actif |
| `NotificationsModule` | Notifications, trois règles quotidiennes, écouteur de soumission | Actif ; écouteur « document » et règle « activité en retard » vides |
| `TableauDeBordModule` | Compteurs, répartition, échéancier | Actif |
| `StatistiquesModule` | Comparatif par établissement | Actif |
| `SyntheseModule` | Synthèse annuelle et éléments narratifs | Actif |
| `ReferentielsModule` | Bailleurs, bénéficiaires, porteurs, sites | Actif |
| `ArchivesModule` | Consultation, détail et restauration des archives (6 types) | Actif |
| `RechercheModule` | Recherche transverse sur 5 types d'objets | Actif |
| `CleanupModule` | Nettoyage des fichiers orphelins et endpoint de maintenance | Actif |
| `ExportModule` | Export PDF/Excel des projets et conventions | Actif |
| `EspacePublicModule` | Vitrine publique | Actif ; le contact public n'a pas de route |
| `StorageModule` | Port de stockage et adaptateur local | Actif |
| `MailModule` | Port de messagerie, adaptateurs `noop` et `smtp`, écouteur d'événement de mot de passe modifié | Actif |
| `HealthModule` | Contrôle de santé | Actif |
| `activites/` (activités + chronogramme) | 11 fichiers vides, non importés par `AppModule` | **Inactif** |
| `utilisateurs/` | 5 fichiers vides, non importé par `AppModule` | **Inactif** |

**Autres fichiers vides repérés** (0 octet) : `common/pipes/parse-pagination.pipe.ts`, `common/enums/etape-circuit.enum.ts`, `conventions/etape-circuit.service.ts`, `conventions/dto/update-etape-circuit.dto.ts`, `notifications/listeners/document.listener.ts`, `notifications/rules/activite-retard.rule.ts`, `partenaires/contacts/dto/contact-response.dto.ts`.

## 7.2. Matrice des accès par endpoint

Légende : **P** = Présidence, **E** = Établissement, **D** = Décideur, **Public** = accès sans authentification. « Tous » = tout compte authentifié.

| Domaine | Endpoint | Rôles autorisés |
|---|---|---|
| Authentification | `POST /api/auth/login`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`, `/refresh` | Public |
| Authentification | `POST /api/auth/logout`, `GET /api/auth/me` | Tous |
| Etablissements | `GET /api/etablissements`, `GET /api/etablissements/:id` | Tous |
| Partenaires | `GET /api/partenaires`, `GET /api/partenaires/:id`, `GET /api/partenaires/recherche-doublon` | Tous (filtré par établissement pour E) |
| Partenaires | `POST /api/partenaires`, `PATCH /api/partenaires/:id`, contacts (`POST/PATCH/DELETE`) | P, E |
| Partenaires | `POST /api/partenaires/:id/archiver` | P |
| Partenariats | `GET /api/partenariats`, `GET /api/partenariats/:id` | Tous (filtré pour E) |
| Partenariats | `POST /api/partenariats`, `PATCH /api/partenariats/:id`, `POST /api/partenariats/:id/soumettre` | P, E |
| Partenariats | `POST /api/partenariats/:id/archiver` | P |
| Projets | `GET /api/projets`, `GET /api/projets/:id` | Tous (filtré pour E) |
| Projets | `GET /api/projets/:id/avancement` | P, E |
| Projets | `POST /api/projets`, `PATCH /api/projets/:id`, `POST /api/projets/:id/soumettre` | P, E |
| Projets | `POST /api/projets/:id/archiver` | P |
| Cotutelles | `GET /api/cotutelles`, `GET /api/cotutelles/:id` | P, D |
| Cotutelles | `POST /api/cotutelles`, `PATCH /api/cotutelles/:id`, `POST /api/cotutelles/:id/archiver` | P |
| Conventions | `GET /api/conventions`, `GET /api/conventions/:id` | P, D |
| Conventions | `POST /api/conventions`, `PATCH /api/conventions/:id`, `POST /api/conventions/:id/archiver` | P |
| Documents | `POST /api/documents`, `GET /api/documents`, `GET /api/documents/:id`, `GET /api/documents/:id/telecharger`, `GET /api/documents/:id/versions`, `DELETE /api/documents/:id` | P |
| Publications | `POST /api/publications`, `PATCH /api/publications/:id`, `PATCH /api/publications/:id/publier`, `POST /api/publications/:publicationId/photos`, `DELETE /api/photos/:id` | P |
| Publications | `GET /api/publications`, `GET /api/publications/:id`, `GET /api/publications/:publicationId/photos` | P, D |
| Notifications | `GET /api/notifications`, `GET /api/notifications/non-lues/count`, `PATCH /api/notifications/:id/lue`, `PATCH /api/notifications/tout-marquer-lu` | P, E, D |
| Tableau de bord | `GET /api/tableau-de-bord`, `GET /api/tableau-de-bord/echeancier` | P, E, D |
| Statistiques | `GET /api/statistiques/comparatif-etablissements` | P, D |
| Synthèse | `GET /api/synthese`, `GET /api/synthese/:etablissementId`, `GET /api/synthese/items`, `GET /api/synthese/partenaires-strategiques` | P, D |
| Synthèse | `POST /api/synthese/items`, `POST /api/synthese/partenaires-strategiques`, `DELETE /api/synthese/items/:id`, `DELETE /api/synthese/partenaires-strategiques/:id` | P |
| Référentiels | `GET` sur `/api/referentiels/{bailleurs,beneficiaires,porteurs,sites}` | P, E, D |
| Référentiels | `POST`, `PATCH`, `DELETE` sur les mêmes chemins | P |
| Archives | `GET /api/archives/{type}` (6 types) et `GET /api/archives/:type/:id` | P, E, D (filtré pour E) |
| Archives | `POST /api/archives/:type/:id/restaurer` | P, E |
| Recherche | `GET /api/recherche` | P, E, D (filtré pour E) |
| Export | `GET /api/export/projets`, `GET /api/export/conventions` | P, D |
| Espace public | `GET /api/public/accueil`, `/publications`, `/publications/:id`, `/etablissements`, `/partenaires` | Public |
| Santé | `GET /api/health` | Public |
| Maintenance | `POST /api/maintenance/nettoyage` | P |

## 7.3. Points d'attention sur le contrat d'API

- `GET /api/partenaires` renvoie les entités brutes (colonnes internes incluses) au lieu d'un DTO de réponse : c'est le seul domaine dans ce cas.
- Le service `findAll` des projets accepte les paramètres de période `date_debut_from` et `date_debut_to` mais ne les applique pas dans la clause `WHERE` : ils sont silencieusement ignorés.
- `PATCH /api/projets/:id`, `PATCH /api/partenariats/:id` et `PATCH /api/cotutelles/:id` héritent du DTO de création par `PartialType`, mais les **listes d'associations** (`partenaires_ids`, `beneficiaires_ids`, `bailleurs_ids`, `sites_ids`, `etablissements_ids`) y sont acceptées par la validation puis **ignorées** par les services : aucun effet, aucune erreur.
- Aucune version d'API n'est présente dans le chemin (`/api`, pas `/api/v1`) : l'évolution du contrat n'est pas cadrée.

---

# 8. Parcours utilisateurs

## 8.1. Équipe Projet et Partenariat — **Implémenté**

Le parcours réel dans l'application est le suivant :

1. Connexion (e-mail et mot de passe) sur `/connexion`, redirection vers `/presidence`.
2. Tableau de bord : compteurs globaux, conventions à traiter (échéancier), activité mensuelle (état vide, endpoint absent), répartition des conventions par statut, bandeau d'état.
3. Menu « Partenaires & Partenariats » : partenaires (création, modification, archivage, contacts) et partenariats (assistant de création en plusieurs étapes : établissements concernés, partenaires concernés, informations générales, champs de suivi ; soumission ; archivage).
4. « Cotutelles » : liste, création, modification, archivage.
5. « Projets » : liste filtrable, création par assistant (informations, partenariat, partenaires propres, bénéficiaires, bailleurs, sites, porteur, budget), fiche projet (informations et documents), soumission, archivage, publication éventuelle.
6. « Conventions » : liste filtrable, création, modification, archivage ; fiche avec documents rattachés. **Aucune étape de circuit n'est affichée**.
7. « Documents » : téléversement avec type, rattachement à un projet ou à une convention, liste des versions, téléchargement.
8. « Publications » : création par projet, rédaction, ajout et réordonnancement des photos, publication.
9. « Référentiels » : bailleurs, bénéficiaires, porteurs, sites.
10. « Archives » : consultation des six types d'éléments archivés, détail, restauration.
11. « Recherche » : recherche transverse sur cinq types d'objets.
12. « Synthèse annuelle » : synthèse globale par année, synthèse par établissement, saisie des trois éléments narratifs, désignation des partenaires stratégiques.
13. « Notifications » : liste, filtre par état, marquage comme lue, accès à l'élément concerné.
14. « Paramètres » : **écran présent mais inopérant** (les deux endpoints appelés n'existent pas, voir §5.20).

## 8.2. Établissement — **Implémenté, périmètre réduit**

1. Connexion, redirection vers `/etablissement`.
2. Tableau de bord restreint à ses données : compteurs, projets à suivre, répartition de ses projets par statut, bandeau d'état.
3. « Mes partenaires & partenariats » : liste de ses partenaires et partenariats, création, modification (partenariat modifiable tant qu'il est en brouillon), soumission à la Présidence.
4. « Mes projets » : liste, création par assistant, fiche projet (informations et documents), modification tant que le projet est en brouillon, soumission.
5. « Cotutelles » : **route présente mais inaccessible** (403 côté API, voir §5.6).
6. « Notifications » : ses notifications (notamment les alertes de retard de projet et d'expiration de convention le concernant).
7. « Archives » : ses propres éléments archivés.

Ce qui **n'existe pas** dans cet espace, contrairement à la version 4 §9.2 et §12 : conventions, documents, publications, recherche, export, synthèse, activités et chronogramme.

## 8.3. Décideur — **Implémenté**

1. Connexion, redirection vers `/decideur`.
2. Tableau de bord : compteurs globaux, comparatif par établissement, répartition des conventions par statut, activité mensuelle (état vide), conventions à échéance (lecture seule).
3. Consultation en lecture seule : partenaires, partenariats, projets, conventions, cotutelles, documents, établissements, synthèse, archives.
4. Droits d'écriture strictement nuls : aucun bouton de création, de modification ou d'archivage.

## 8.4. Visiteur — **Implémenté**

1. Accueil : présentation, statistiques publiques (partenaires actifs publics, projets en cours, conventions signées ou actives), dernières publications, sections partenaires et établissements.
2. « À propos », « Établissements », « Partenaires », « Projets & partenariats » (liste et détail des publications publiées), « Contact » (formulaire présent mais non fonctionnel faute d'endpoint, voir §5.17).
3. Accès au formulaire de connexion depuis l'en-tête public.

---

# 9. Écrans et routes de l'application

## 9.1. Routes publiques

| Route | Écran |
|---|---|
| `/` | Accueil (présentation, statistiques, publications récentes, partenaires, établissements) |
| `/a-propos` | À propos |
| `/etablissements` | Liste des établissements |
| `/partenaires` | Partenaires publics |
| `/projets-partenariats` | Publications publiées (vitrine des projets) |
| `/projets-partenariats/publication/:id` | Détail d'une publication |
| `/contact` | Contact (formulaire non relié à l'API) |
| `/connexion`, `/mot-de-passe-oublie`, `/reset-password` | Authentification et réinitialisation |

## 9.2. Routes internes — Présidence

| Route | Écran |
|---|---|
| `/presidence` | Tableau de bord global |
| `/presidence/partenaires-partenariats/partenaires` (+ `/nouveau`, `/:id`) | Partenaires : liste, création, fiche |
| `/presidence/partenaires-partenariats/partenariats` (+ `/nouveau`, `/:id`) | Partenariats : liste, création, fiche |
| `/presidence/cotutelles` (+ `/:id`) | Cotutelles : liste et fiche |
| `/presidence/projets` (+ `/nouveau`, `/:id`, `/:id/modifier`) | Projets : liste, création, fiche, modification |
| `/presidence/conventions` (+ `/:id`) | Conventions : liste et fiche |
| `/presidence/documents` (+ `/nouveau`, `/:id`) | Documents : liste, téléversement, détail avec versions |
| `/presidence/publications` et `/presidence/publications/:projetId` | Publications : liste et éditeur |
| `/presidence/referentiels` | Référentiels (bailleurs, bénéficiaires, porteurs, sites) |
| `/presidence/archives` (+ `/:type/:id`) | Archives : liste par type et détail |
| `/presidence/recherche` | Recherche transverse |
| `/presidence/synthese` (+ `/:etablissementId`) | Synthèse annuelle globale et par établissement |
| `/presidence/notifications` | Notifications |
| `/presidence/export` | Export — **écran d'attente, fonctionnalité non branchée** |
| `/presidence/parametres` | Paramètres du compte — **inopérant** |

## 9.3. Routes internes — Établissement et Décideur

| Route | Écran |
|---|---|
| `/etablissement` | Tableau de bord de l'établissement |
| `/etablissement/partenaires-partenariats/partenaires` (+ `/nouveau`, `/:id`) | Mes partenaires |
| `/etablissement/partenaires-partenariats/partenariats` (+ `/nouveau`, `/:id`) | Mes partenariats |
| `/etablissement/projets` (+ `/nouveau`, `/:id`, `/:id/modifier`) | Mes projets |
| `/etablissement/cotutelles` (+ `/:id`) | Cotutelles — **403 attendu côté API** |
| `/etablissement/archives` (+ `/:type/:id`) | Mes archives |
| `/etablissement/notifications` | Mes notifications |
| `/etablissement/parametres` | Paramètres — **inopérant** |
| `/decideur` | Tableau de bord du Décideur |
| `/decideur/partenaires-partenariats/partenaires` (+ `/:id`) | Consultation des partenaires |
| `/decideur/partenaires-partenariats/partenariats` (+ `/:id`) | Consultation des partenariats |
| `/decideur/projets` (+ `/:id`) | Consultation des projets |
| `/decideur/conventions` (+ `/:id`) | Consultation des conventions |
| `/decideur/cotutelles` (+ `/:id`) | Consultation des cotutelles |
| `/decideur/documents` (+ `/:id`) | Consultation des documents — **le Décideur n'a pas les droits `documents` côté API** (seul `PRESIDENCE`) |
| `/decideur/etablissements` (+ `/:id`) | Consultation des établissements |
| `/decideur/synthese` (+ `/:etablissementId`) | Consultation de la synthèse |
| `/decideur/archives` (+ `/:type/:id`) | Consultation des archives |
| `/decideur/parametres` | Paramètres — **inopérant** |

**Incohérences relevées entre routes front-end et droits de l'API** : `/etablissement/cotutelles` (403), `/decideur/documents` (403), `/presidence/export` (écran d'attente alors que l'API existe), `/presidence/parametres` et variantes (404 sur les deux endpoints de compte), `/presidence/publications` absent pour `/etablissement` alors que la version 4 le prévoyait.

## 9.4. Composants transverses d'interface

| Composant | Rôle |
|---|---|
| `SidebarInterne.tsx` | Navigation par rôle et par groupe (« Pilotage », « Diffusion »), repliable, mémorisée dans le stockage local |
| `TopbarInterne.tsx` | Barre supérieure de l'espace interne |
| `NotificationsDrawer.tsx` | Tiroir latéral des notifications |
| `CommandPalette.tsx` | Palette de commandes ouverte par le bouton de recherche de la barre supérieure ou par le raccourci clavier Ctrl (ou Cmd) plus K (montée dans `LayoutInterne`, `router.tsx`). Elle ne propose que **cinq raccourcis figés** vers des écrans de la Présidence : ce n'est pas une recherche globale (la recherche transverse passe par `/presidence/recherche` ou `GET /api/recherche`) |
| `DataTable.tsx`, `TableToolbar.tsx`, `FacetedFilters.tsx`, `FilterChips.tsx`, `TablePagination.tsx` | Tableaux, filtres et pagination |
| `KpiCard.tsx`, `KpiGrid.tsx`, `Panel.tsx`, `RepartitionBars.tsx`, `StatusStrip.tsx`, `AnimatedCounter.tsx` | Indicateurs et panneaux de tableau de bord |
| `Wizard.tsx`, `WizardStep.tsx`, `WizardProgressBar.tsx`, `useWizardDraft.ts` | Assistants de création multi-étapes avec brouillon |
| `ChecklistSelection.tsx` et `Selection*.tsx` | Sélection multiple par cases à cocher |
| `Dropzone.tsx`, `DocumentDropzone.tsx`, `TeleversementPhotos.tsx` | Téléversements |
| `ConfirmDialog.tsx`, `DestructiveConfirmDialog.tsx` | Confirmations d'action |
| `ErrorBoundary.tsx`, `ForbiddenPage.tsx`, `NotFoundPage.tsx`, `EmptyState.tsx` | États d'erreur et états vides |

---

# 10. Notifications : fonctionnement détaillé

## 10.1. Notifications déclenchées par une action

| Événement | Émetteur | Déclencheur | Destinataires | Priorité | Anti-répétition |
|---|---|---|---|---|---|
| `projet.soumis` | `ProjetsService.soumettre` | Passage d'un projet de `BROUILLON` à `EN_ATTENTE` | Tous les utilisateurs `PRESIDENCE` actifs | Haute | 1 jour (valeur par défaut du service) |
| `partenariat.soumis` | `PartenariatsService.soumettre` | Passage d'un partenariat de `BROUILLON` à `EN_ATTENTE` | Tous les utilisateurs `PRESIDENCE` actifs | Haute | 1 jour |

Aucun autre événement n'est émis par le code (vérifié sur l'ensemble des appels `emit`).

## 10.2. Notifications issues du contrôle périodique (tâche de 06 h 00)

| Règle | Objets examinés | Condition | Destinataires | Priorité | Anti-répétition |
|---|---|---|---|---|---|
| `ConventionExpirationRule` | Conventions non archivées de statut `SIGNEE` ou `ACTIVE` dont la date de fin tombe dans les 30 jours | Le seuil franchi (30, puis 15, puis 7 jours) | Présidence + utilisateurs de l'établissement du projet rattaché (s'il existe) | Haute | 30 jours |
| `ConventionExpireeRule` | Conventions non archivées dont la date de fin est dépassée | Toujours | Présidence + établissement du projet rattaché | Haute | 30 jours |
| `ProjetRetardRule` | Projets non archivés, hors `BROUILLON`/`TERMINE`/`EXPIRE`, dont la date de fin prévue est dépassée | Toujours | Présidence (haute) + établissement concerné (moyenne) | Haute / Moyenne | 7 jours |

Le mécanisme d'anti-répétition est implémenté dans `NotificationsService.creer` : une notification identique (même utilisateur, même type, même référence, même titre) n'est pas créée si une notification équivalente existe dans la fenêtre indiquée. Ce dispositif répond à l'exigence « limiter la répétition excessive des notifications » de la version 4 §11.6.

## 10.3. Affichage et traitement

- Espace dédié : pages `/presidence/notifications` et `/etablissement/notifications` ; tiroir accessible depuis la barre supérieure ; compteur de non-lues (`NotificationBadge.tsx`).
- Rafraîchissement automatique toutes les 45 secondes, suspendu lorsque l'onglet du navigateur est masqué (`useVisibilityGuard.ts`).
- Marquage comme lue à l'unité ou en bloc.
- Accès direct à l'élément concerné grâce au couple `reference_type` / `reference_id` (valeurs utilisées dans le code : `Projet`, `Partenariat`, `Convention`).

---

# 11. Exigences non fonctionnelles

Le texte des exigences est celui de la version 4 (§11). La colonne « État » résulte de l'analyse du code.

| Exigence (v4 §11) | Texte de référence | État constaté |
|---|---|---|
| 11.1 Simplicité d'utilisation et ergonomie | Les établissements doivent pouvoir ajouter leurs projets et partenariats sans connaissances techniques ; les relations complexes doivent rester invisibles ; partenaires et partenariats regroupés dans une même interface | **Respecté** — assistants multi-étapes, sélections par cases à cocher, regroupement des deux domaines sous une entrée de menu unique |
| 11.2 Sécurité | Séparation des données entre établissements ; documents et archives accessibles aux seuls utilisateurs autorisés | **Respecté avec réserve** — cloisonnement effectif (garde + filtres), mais l'accès aux documents est limité à la Présidence, y compris pour les projets de l'établissement concerné |
| 11.3 Gestion des fichiers | Stockage sécurisé ; formats et limites définis lors de la conception technique | **Précisé et respecté** — formats et plafonds sont implémentés (documents : PDF/JPEG/PNG/Word, 10 Mo ; photos : JPEG/PNG/WebP) ; le stockage est local au serveur (voir réserve au chapitre 14) |
| 11.4 Performance | Temps de réponse acceptables, y compris lorsque le volume augmente | **Non mesuré** — aucune campagne de mesure ni jeu de données de charge n'a été trouvé ; les listes sont paginées (20 par défaut) et les index de base sont posés sur les colonnes de filtrage principales |
| 11.5 Maintenabilité et évolutivité | Ajout ultérieur de fonctionnalités ou d'informations, notamment la structure définitive des bailleurs | **Respecté** — architecture modulaire NestJS, migrations versionnées, ports et adaptateurs pour le stockage, le courriel, l'export ; référentiels séparés (`Bailleur` réduit à nom et description, extensible) |
| 11.6 Fiabilité des notifications automatiques | Détection périodique fiable, analyse des dates de conventions, d'activités et de projets, limitation de la répétition excessive | **Partiel** — détection quotidienne opérationnelle pour les conventions et les projets ; les activités ne sont pas couvertes ; l'anti-répétition est implémenté ; aucune supervision ni alerte en cas d'échec d'une tâche n'existe (les erreurs sont journalisées) |

## 11.1. Exigences non fonctionnelles complémentaires, constatées dans le code

| Domaine | Mise en œuvre |
|---|---|
| Disponibilité de la base | Contrôle de santé `/api/health` renvoyant HTTP 503 si la base est injoignable ; `healthcheck` Docker sur le service `db` |
| Reprise après incident | Arrêt gracieux activé (`app.enableShutdownHooks()`) ; aucune stratégie de sauvegarde de la base ou des fichiers n'est décrite dans le dépôt — **À PRÉCISER** |
| Traçabilité | Journalisation applicative des requêtes et des erreurs ; **aucune journalisation d'audit métier** (qui a modifié quoi) n'a été trouvée — **À PRÉCISER** : ce point pourra être exigé pour les données sensibles |
| Accessibilité | Composants Radix (rôles ARIA, navigation clavier) et libellés français ; aucun audit d'accessibilité formel (RGAA/WCAG) n'a été trouvé |
| Internationalisation | Interface et API entièrement en français ; aucune infrastructure de traduction |
| Compatibilité navigateurs | Cibles définies dans la configuration de compilation (TypeScript moderne) ; aucune matrice de navigateurs testés n'est documentée |

---

# 12. Qualité, tests et outillage

## 12.1. Tests du back-end

| Type | Volume constaté | Outillage |
|---|---|---|
| Tests unitaires | 8 fichiers (`*.spec.ts`) — environ 50 cas de test | Jest + ts-jest |
| Tests d'intégration HTTP | 7 fichiers (`test/*.e2e-spec.ts`) — 83 cas de test | Jest + Supertest |
| Base de données des tests | PostgreSQL en mémoire (PGlite exposé sur une socket TCP), migrations réelles appliquées | `@electric-sql/pglite`, `@electric-sql/pglite-socket` |

Les fichiers de suivi du dépôt annoncent « 5 suites / 37 tests » pour les tests unitaires (`README.md`, `MIGRATION_CONTEXT.md`) alors que 8 fichiers de tests unitaires sont présents : **la documentation interne est en retard sur le code** ; ce point est signalé et non corrigé par la présente version.

Couverture fonctionnelle des tests d'intégration HTTP (d'après les noms de fichiers) : application et santé, authentification, conventions, partenaires, projets, règles de dates, régressions.

## 12.2. Tests du front-end

| Type | Volume constaté |
|---|---|
| Tests unitaires et de composants | 9 fichiers dans `frontend/tests/` (validation de mot de passe, pages d'authentification, construction des charges utiles, schéma de publication, règles de dates, synthèse API et pages de synthèse, logique pure de synthèse) |
| Test d'intégration bout en bout | 1 scénario : parcours « mot de passe oublié » (page React, appels API réels, lecture du lien dans le journal du back-end) |
| Tests de bout en bout navigateur | **Absents** : la configuration Playwright existe mais ni la suite ni la dépendance |

Commandes : `npm test` (Vitest), `npm run test:integration` (parcours de réinitialisation, conteneurs requis), `cd backend && npm test && npm run test:e2e`.

## 12.3. Scénarios de recette fonctionnelle

20 scripts PowerShell (`test-*.ps1` à la racine du dépôt) s'exécutent contre une API démarrée et vérifient, domaine par domaine : santé et en-têtes de sécurité (`test-bloc-a.ps1`), authentification et rotation des jetons (`test-refresh-rotation.ps1`), limitation de débit (`test-rate-limit.ps1`), mot de passe oublié, référentiels, partenaires, partenariats, projets, cotutelles, conventions, documents, publications, notifications, recherche, archives, synthèse, tableau de bord, espace public, export, nettoyage manuel.

Ces scripts constituent la recette de non-régression fonctionnelle du projet ; ils ne sont pas automatisés (aucun pipeline trouvé).

## 12.4. Jeu de données de démonstration

Le script `backend/src/database/seed.ts` vide les tables puis crée : deux établissements (Faculté des Sciences, Faculté des Lettres et Sciences Humaines), quatre comptes avec le mot de passe `password123` (`presidence@univ-fianarantsoa.mg`, `fds@univ-fianarantsoa.mg`, `flsh@univ-fianarantsoa.mg`, `president@univ-fianarantsoa.mg`), un porteur, un bailleur, un bénéficiaire, un site, un partenaire (Université de Toulouse) avec un contact, un partenariat avec ses associations, un projet avec bailleur, bénéficiaire, site et partenaire associés, une activité, et une convention. Ce jeu de données est la seule source d'activités existante (voir §5.8).

## 12.5. Dette technique connue

| Point | Source |
|---|---|
| `contact-response.dto.ts` vide : les contacts sont renvoyés sous forme d'entités brutes | `SUIVI_TECHNIQUES.md` |
| `normaliserPrenom()` inutilisée côté front-end | `SUIVI_TECHNIQUES.md` |
| Composant `ContactForm.tsx` hérité, non utilisé (le formulaire actif est `ContactDialog.tsx`) | `SUIVI_TECHNIQUES.md` |
| Modules `activites`, `utilisateurs` et cinq autres fichiers présents mais vides | `MIGRATION_CONTEXT.md` et vérification directe |
| Duplication de la logique d'avancement entre `AvancementService` et `ProjetsService.enrichir` | lecture du code |
| Énumération `Role` définie deux fois (`common/enums/role.enum.ts` et `database/enums/role.enum.ts`) | lecture du code |
| `parse-pagination.pipe.ts` vide : la pagination est validée par les DTO et non par un pipe dédié | lecture du code |
| Paramètre `date_debut_from`/`date_debut_to` accepté mais non appliqué sur les projets | lecture du code |

---

# 13. Synthèse des écarts et des apports de la version 5

## 13.1. Écarts entre la spécification (v4) et l'implémentation

| # | Fonctionnalité spécifiée en v4 | État | Impact |
|---|---|---|---|
| 1 | Activités d'un projet (§5.12) | Absent (fichiers vides) | Pas de décomposition opérationnelle des projets |
| 2 | Chronogramme mensuel/trimestriel en jours (§5.13) | Absent (table non exploitée) | La pratique actuelle de suivi de l'équipe n'est pas couverte |
| 3 | Avancement automatique alimenté par les activités (RG13) | Calcul présent, alimentation impossible | Indicateur figé |
| 4 | Alertes sur les échéances et retards d'activité (RG38, RG39) | Absent | Perte de l'effet d'alerte |
| 5 | Étape du circuit de traitement des conventions (RG22) | Absent | Circuit suivi hors plateforme |
| 6 | Téléversement et gestion des logos (RG27) | Partiel (colonnes seules) | Logos non administrables depuis l'application |
| 7 | Conventions et documents pour l'Établissement (§12) | Absent (réservé à la Présidence) | L'établissement ne peut pas gérer ses conventions ni téléverser ses documents |
| 8 | Publications pour l'Établissement (§12) | Absent (réservé à la Présidence) | La communication publique reste centralisée |
| 9 | Notification à l'ajout d'un partenaire, d'un partenariat ou d'un projet (RG34) | Partiel (soumission uniquement) | Informations non soumises invisibles pour l'équipe |
| 10 | Notification de modification importante (RG35) | Absent | Pas de veille sur les modifications |
| 11 | Formulaire de contact de l'espace public (§5.22) | Partiel (aucune route) | Les messages des visiteurs ne sont pas reçus |
| 12 | Changement de mot de passe par l'utilisateur | Absent (module vide) | L'écran « Paramètres » échoue ; contournement par « mot de passe oublié » |
| 13 | Consultation des documents par le Décideur (§12) | Absent (droits API) | L'écran existe mais renvoie une erreur |
| 14 | Compteur d'activité mensuelle du tableau de bord | Absent côté API | Bloc affiché en état vide |
| 15 | Export de la synthèse annuelle | Absent | La synthèse reste consultable à l'écran seulement |
| 16 | Filtrage des projets par période et par avancement (§5.19) | Partiel | Filtres annoncés non fonctionnels |
| 17 | Recherche incluant les archives (§5.19) | Partiel | Recherche limitée à cinq types d'objets |
| 18 | Comptes uniques par rôle (RG01, RG02) | Non contraint | Risque de doublons de comptes |
| 19 | Notification liée à un « groupe d'utilisateurs » (RG42) | Non modélisé | Duplication des notifications par utilisateur |

## 13.2. Fonctionnalités présentes dans le code et non prévues par la version 4

| # | Apport | Référence |
|---|---|---|
| 1 | Rafraîchissement de session avec rotation et révocation des jetons | `auth.service.ts`, `RefreshToken` |
| 2 | Mot de passe oublié par e-mail avec lien à usage unique et anti-énumération | §5.1 |
| 3 | Limitation de débit (globale et ciblée) et en-têtes Helmet | §3.5 |
| 4 | Enveloppe de réponse unique avec traduction des erreurs PostgreSQL | §3.4 |
| 5 | Circuit de soumission brouillon → en attente pour projets et partenariats | §5.5, §5.7 |
| 6 | Échéancier du tableau de bord (conventions à échéance, projets en retard) | §5.15 |
| 7 | Comparatif statistique par établissement | §5.15 |
| 8 | Export PDF et Excel des projets et des conventions | §5.18 |
| 9 | Référentiels administrables (bailleurs, bénéficiaires, porteurs, sites) | §5.19 |
| 10 | Restauration d'un élément archivé | §5.11 |
| 11 | Nettoyage automatique des fichiers orphelins et endpoint de maintenance | §5.21 |
| 12 | Contrôle de santé public | §3.7 |
| 13 | Recherche transverse multicritère sur cinq types d'objets | §5.14 |
| 14 | Anti-répétition des notifications | §10.2 |
| 15 | Règles de dates (date de début non passée, fin postérieure au début) avec fuseau dédié | §3.5, `common/validators/dates.validator.ts` |
| 16 | Assistants de saisie avec brouillon, filtres à facettes, palette de commandes | §5.22, §9.4 |

---

# 14. Informations manquantes et points à préciser

Cette section recense **explicitement ce qui n'a pas pu être établi** à partir du document de référence et du code. Aucune de ces informations n'a été supposée dans les chapitres précédents.

## 14.1. Questions fonctionnelles à l'équipe Projet et Partenariat

| # | Question |
|---|---|
| F1 | Les activités et le chronogramme (suivi en jours par mois et par trimestre) doivent-ils être développés, ou la pratique est-elle abandonnée ? Si oui, quels écrans et quelles règles de saisie (qui saisit, qui valide) ? |
| F2 | Le circuit de traitement des conventions (Projet et Partenariat, Secrétaire principale, Affaires Juridiques, Signature) doit-il être suivi dans la plateforme ? Si oui, quelles étapes nommées, quels droits, et faut-il notifier chaque changement d'étape ? |
| F3 | Les établissements doivent-ils gérer eux-mêmes leurs conventions, documents et publications, comme l'indiquent les tableaux §9.2 et §12 de la version 4, ou ce périmètre doit-il rester réservé à la Présidence ? |
| F4 | Un établissement doit-il pouvoir créer ses propres bailleurs, bénéficiaires, porteurs et sites (aujourd'hui réservé à la Présidence) ? |
| F5 | Quelle règle d'unicité appliquer aux partenaires : par établissement (comportement actuel) ou au niveau de l'Université ? |
| F6 | Quelle devise et quel format pour le budget des projets ? |
| F7 | Les comptes doivent-ils être strictement uniques par établissement (RG02) ? Qui les crée et selon quelle procédure administrative ? |
| F8 | Le formulaire de contact public doit-il enregistrer les messages (table dédiée) et notifier la Présidence ? |
| F9 | La synthèse annuelle doit-elle être exportable (PDF, Excel) et selon quel modèle de présentation officiel ? |
| F10 | Quels sont les « seuils d'alerte » définitifs avant expiration d'une convention : 30/15/7 jours (implémenté), autres valeurs ? |
| F11 | Qui doit être destinataire des alertes : Présidence seule, établissement concerné, Décideur ? |
| F12 | Quel contenu exact doit apparaître sur la vitrine publique (le logo officiel de l'Université, les coordonnées des partenaires, les montants des projets...) ? |
| F13 | Faut-il une journalisation d'audit retraçant les modifications (auteur, date, ancienne et nouvelle valeur) ? |
| F14 | Quelles sont les exigences de sauvegarde et de rétention (base de données, fichiers téléversés) ? |

## 14.2. Points techniques non documentés dans le dépôt

| # | Point |
|---|---|
| T1 | Aucun environnement de production décrit : nom de domaine, hébergement, certificat HTTPS, procédure de déploiement, sauvegardes |
| T2 | Le stockage des fichiers est local au conteneur (volume `./backend/uploads`) : aucune stratégie de stockage objet, de sauvegarde ni de redimensionnement des images n'est prévue |
| T3 | L'authentification par jeton est stockée côté navigateur ; le fichier `frontend/src/lib/token-storage.ts` n'a pas été analysé en détail dans cette mise à jour (**À PRÉCISER** : choix entre mémoire, `sessionStorage` et `localStorage`, et risque d'exposition au script) |
| T4 | Les images WebP sont acceptées pour les photos mais pas mentionnées dans les exigences de format de la version 4 |
| T5 | Aucune configuration d'intégration continue, de déploiement automatique ni d'analyse statique bloquante (ESLint et oxlint sont présents mais lancés manuellement) |
| T6 | Les règles de calcul de l'avancement (arrondi à l'entier) et des jours restants/retard (arrondi supérieur) sont des choix d'implémentation à valider |
| T7 | La variable `DB_POOL_MAX` n'est pas documentée dans `.env.example` |
| T8 | Le paramètre `?schema=public` de l'exemple `DATABASE_URL` est un reliquat de l'ancienne couche Prisma (`MIGRATION_CONTEXT.md`) |
| T9 | La signification et le maintien de la signature `ITDCMADA` dans le contrat d'API ne sont pas justifiés dans le dépôt |
| T10 | La compatibilité ascendante du schéma avec une base créée par l'ancienne couche Prisma est traitée par un test d'existence de table dans la migration initiale ; la procédure de migration d'une base réelle n'est pas documentée pas à pas |
| T11 | Les seuils de performance attendus (§11.4) ne sont pas chiffrés |
| T12 | Aucune politique de nommage des fichiers téléversés n'est communiquée aux utilisateurs (les noms d'origine sont conservés en base mais les fichiers sont renommés en UUID sur le disque) |

---

# 15. Annexes

## 15.1. Arborescence du dépôt

```
plateforme-suivi-projet-partenariat/
├── backend/                     API NestJS 11 + TypeORM
│   ├── src/
│   │   ├── auth/                authentification, jetons, utilisateur
│   │   ├── etablissements/      établissements (lecture)
│   │   ├── partenaires/         partenaires + contacts/
│   │   ├── partenariats/        partenariats et associations
│   │   ├── projets/             projets, activités, avancement, associations
│   │   ├── cotutelles/          cotutelles de thèses
│   │   ├── conventions/         conventions
│   │   ├── documents/           documents versions
│   │   ├── publications/        publications + photos/
│   │   ├── notifications/       notifications, règles, écouteurs
│   │   ├── tableau-de-bord/     indicateurs et échéancier
│   │   ├── statistiques/        comparatif par établissement
│   │   ├── synthese/            synthèse annuelle
│   │   ├── referentiels/        bailleurs, bénéficiaires, porteurs, sites
│   │   ├── archives/            archives et restauration
│   │   ├── recherche/           recherche transverse
│   │   ├── export/              export PDF et Excel (ports et adaptateurs)
│   │   ├── espace-public/       vitrine publique
│   │   ├── storage/             port de stockage et adaptateur local
│   │   ├── mail/                port de messagerie (noop, smtp)
│   │   ├── cleanup/             nettoyage des fichiers orphelins
│   │   ├── health/              contrôle de santé
│   │   ├── common/              gardes, filtres, intercepteurs, énumérations, validateurs
│   │   ├── config/              configuration HTTP et validation d'environnement
│   │   ├── database/            DataSource, entités, migrations, seed
│   │   ├── activites/           (vide) activités et chronogramme
│   │   └── utilisateurs/        (vide)
│   ├── scripts/                 génération de migration, vérification, serveur PGlite
│   ├── test/                    7 fichiers de tests d'intégration HTTP + harnais
│   └── Dockerfile
├── frontend/                    interface React 19 + Vite
│   ├── src/
│   │   ├── components/          layout, formulaires, composants partagés, composants UI
│   │   ├── features/            un dossier par domaine fonctionnel (api, components, pages)
│   │   ├── hooks/, lib/, types/, styles/
│   │   └── router.tsx           routes publiques et internes
│   ├── tests/                   tests Vitest et test d'intégration du parcours de réinitialisation
│   └── Dockerfile, nginx.conf
├── docs/                        présent cahier des charges (sources et export PDF)
├── docker-compose.yml           frontend, backend, db
├── test-*.ps1                   20 scénarios de recette fonctionnelle
├── README.md, MIGRATION_CONTEXT.md, SUIVI_TECHNIQUES.md
└── .env.example
```

## 15.2. Variables d'environnement

| Variable | Rôle | Valeur d'exemple |
|---|---|---|
| `DATABASE_URL` | Connexion PostgreSQL | `postgresql://postgres:***@db:5432/plateforme_partenariat` |
| `DB_PASSWORD` | Mot de passe du service PostgreSQL (Docker Compose) | `change_me` |
| `JWT_SECRET` | Signature des jetons d'accès (32 caractères minimum) | — |
| `JWT_REFRESH_SECRET` | Signature des jetons de rafraîchissement (32 caractères minimum) | — |
| `PORT` | Port d'écoute de l'API | `3000` |
| `NODE_ENV` | Environnement (adaptation des limites de débit et des journaux) | `development` |
| `CORS_ORIGINS` | Origines autorisées, séparées par des virgules | `http://localhost:5173` |
| `VITE_API_URL` | URL de l'API utilisée par le front-end | `http://localhost:3000/api` |
| `MAIL_MODE` | Mode d'envoi des courriels : `noop` ou `smtp` | `noop` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Paramètres SMTP (obligatoires si `MAIL_MODE=smtp`) | — |
| `FRONTEND_URL` | Base des liens envoyés par courriel | `http://localhost:5173` |
| `MOT_DE_PASSE_RESET_EXPIRATION_MINUTES` | Durée de validité du lien de réinitialisation | `30` |
| `TZ_APPLICATION` | Fuseau de référence pour les règles de dates | `Indian/Antananarivo` |
| `DB_POOL_MAX` | Taille du pool de connexions (non documentée dans les exemples) | `10` |

## 15.3. Commandes utiles

| Objectif | Commande |
|---|---|
| Démarrer l'ensemble | `cp .env.example .env` puis `docker compose up --build` |
| Front-end | `http://localhost:5173` |
| API | `http://localhost:3000/api` |
| Documentation d'API | `http://localhost:3000/api/docs` |
| Migrations | `npm --prefix backend run migration:run` |
| Données de démonstration | `docker compose exec backend node dist/database/seed.js` |
| Tests back-end | `npm --prefix backend test` et `npm --prefix backend run test:e2e` |
| Tests front-end | `npm --prefix frontend test` |
| Parcours de réinitialisation intégré | `COMMANDE_JOURNAL="docker compose logs backend" npm --prefix frontend run test:integration` |
| Recette fonctionnelle | scripts `test-*.ps1` contre une API démarrée |
| Régénérer l'export PDF de ce document | `python3 outils/markdown-vers-pdf.py docs/cahier-des-charges-v5.md docs/Cahier_des_charges_v5.pdf` (bibliothèque `reportlab`, polices DejaVu) |

## 15.4. Comptes de démonstration

| Adresse | Rôle | Établissement |
|---|---|---|
| `presidence@univ-fianarantsoa.mg` | Présidence | — |
| `fds@univ-fianarantsoa.mg` | Établissement | Faculté des Sciences |
| `flsh@univ-fianarantsoa.mg` | Établissement | Faculté des Lettres et Sciences Humaines |
| `president@univ-fianarantsoa.mg` | Décideur | — |

Mot de passe : `password123`. Le test d'intégration du parcours de réinitialisation laisse le mot de passe du compte de test sur `Reinitialise2026x` ; relancer le script de données de démonstration pour revenir à l'état initial.

## 15.5. Historique des versions

| Version | Date | Contenu |
|---|---|---|
| 1 à 3 | — | Versions intermédiaires antérieures, non fournies dans le dépôt |
| 4 | 16/10/2026 | Version « consolidée à partir des échanges avec l'équipe Projet et Partenariat » : besoins fonctionnels, 44 règles de gestion, modèle de données prévisionnel, parcours, écrans, exigences non fonctionnelles |
| 5 | 16/10/2026 | Présent document : ajout de l'architecture technique réellement implémentée, du modèle de données tel qu'implémenté, de l'état d'implémentation de chaque module et de chaque règle de gestion, des apports non prévus en version 4, et de la liste explicite des écarts et des informations manquantes |

**Note de méthode** : la version 5 est un document de travail établi par lecture du document de référence et du code source. Elle ne remplace pas une validation par l'équipe Projet et Partenariat : les points du chapitre 14 doivent être tranchés avant d'engager les développements complémentaires.
