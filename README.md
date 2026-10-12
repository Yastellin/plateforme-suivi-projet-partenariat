# Plateforme de suivi des projets et partenariats — Université de Fianarantsoa

Monorepo : `frontend/` (React 19 + Vite), `backend/` (NestJS 11 + TypeORM + PostgreSQL 16).

## Démarrage avec Docker

```bash
cp .env.example .env          # renseigner DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| API | http://localhost:3000/api |
| Documentation Swagger | http://localhost:3000/api/docs |

Les migrations TypeORM sont appliquées automatiquement au démarrage du conteneur `backend`.

### Données de démonstration

Le seed crée les établissements, un jeu de données de démonstration et quatre comptes
(mot de passe `password123`) : `presidence@univ-fianarantsoa.mg`,
`fds@univ-fianarantsoa.mg`, `flsh@univ-fianarantsoa.mg`,
`president@univ-fianarantsoa.mg`.

```bash
docker compose exec backend node dist/database/seed.js
```

## Mot de passe oublié (test manuel de bout en bout)

Avec `MAIL_MODE=noop`, l'e-mail est journalisé au lieu d'être envoyé : le lien est
lisible dans les journaux du conteneur.

1. Ouvrir http://localhost:5173/connexion, cliquer sur « Mot de passe oublié ? ».
2. Saisir une adresse connue (par exemple `presidence@univ-fianarantsoa.mg`) puis valider.
   La confirmation affichée est la même quelle que soit l'adresse (anti-énumération).
3. Récupérer le lien :

   ```bash
   docker compose logs backend | grep -o 'http://localhost:5173/reset-password?token=[A-Za-z0-9_-]*' | tail -1
   ```

4. Ouvrir le lien, saisir un mot de passe conforme (8 à 72 caractères, une majuscule,
   une minuscule, un chiffre) puis valider.
5. Se connecter avec le nouveau mot de passe : l'ancien est refusé et les sessions
   ouvertes avant la réinitialisation sont déconnectées.

Le jeton est à usage unique : recharger la page de succès ou rejouer le lien renvoie
une erreur explicite, ce qui est le comportement attendu.

## Tests

```bash
cd backend  && npm test && npm run test:e2e   # Jest : unitaires et intégration HTTP
cd frontend && npm test                       # Vitest : validation, pages et parcours simulés
```

Les tests du backend démarrent un PostgreSQL en mémoire (PGlite) : aucun conteneur
n'est nécessaire. Les scénarios PowerShell `test-*.ps1` s'exécutent contre une API
déjà démarrée.

### Test d'intégration front/back

Le parcours « mot de passe oublié » est vérifié de bout en bout — pages React → API
NestJS → PostgreSQL — par un test qui pilote réellement les formulaires et lit le lien
reçu dans les journaux du backend. À lancer avec les conteneurs démarrés :

```bash
COMMANDE_JOURNAL="docker compose logs backend" npm --prefix frontend run test:integration
```

Variables disponibles : `VITE_API_URL` (défaut `http://localhost:3000/api`),
`URL_API_INTEGRATION` (origine du navigateur simulé, défaut `http://localhost:3000`),
`JOURNAL_BACKEND` (fichier de journal, défaut `/tmp/api.log`) ou `COMMANDE_JOURNAL`,
`COMPTE_INTEGRATION` (défaut `presidence@univ-fianarantsoa.mg`).

Le test modifie le mot de passe du compte de test et le laisse sur
`Reinitialise2026x`, l'API refusant les mots de passe sans majuscule comme celui du
seed : relancez `docker compose exec backend node dist/database/seed.js` pour revenir
à l'état initial. La limitation de débit (3 demandes puis 5 réinitialisations par
minute) est respectée : le test patiente si vous le relancez immédiatement.
