#!/bin/sh
set -e

# 1. Synchronise le schéma Prisma avec la base (création/mise à jour des tables).
echo "[entrypoint] Application du schéma Prisma (db push)..."
npx prisma db push

# 2. Seed idempotent : ne peuple la base que si elle est vide (voir prisma/seed.ts).
#    Indispensable pour que la connexion et la vitrine publique fonctionnent au 1er démarrage.
echo "[entrypoint] Seed de la base (idempotent)..."
npx prisma db seed || echo "[entrypoint] Seed ignoré ou déjà effectué."

# 3. Démarre l'application Nest compilée.
echo "[entrypoint] Démarrage de l'application..."
exec node -e "const fs=require('fs'); const paths=['/app/dist/main.js','/app/dist/src/main.js']; const target=paths.find((p)=>fs.existsSync(p)); if(!target){ console.error('No compiled Nest entry found in /app/dist.'); process.exit(1); } require(target);"
