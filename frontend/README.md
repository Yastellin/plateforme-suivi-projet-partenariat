# Frontend — Plateforme de suivi des projets et partenariats

Interface React 19 + Vite (TypeScript, Tailwind CSS 4) de l'Université de
Fianarantsoa. Elle consomme l'API NestJS du dossier `../backend`.

## Démarrage

```bash
npm install
cp .env.example .env        # /api est relayé vers http://localhost:3000
npm run dev                 # http://localhost:5173
```

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Vérification TypeScript (`tsc -b`) puis build de production |
| `npm run preview` | Sert le build de production |
| `npm run lint` | Oxlint |
| `npm test` | Tests unitaires Vitest (`tests/`) |
| `npm run test:watch` | Tests en mode surveillance |

## Tests

Les tests unitaires couvrent la logique pure : normalisation des payloads
(`src/lib/payload.ts`) et règles de validation des formulaires
(`src/lib/validators/*.schema.ts`). Ils s'exécutent sans navigateur et sans API.

Les scénarios de bout en bout (contrat HTTP, permissions) sont couverts côté
API par `npm run test:e2e` dans `../backend`.
