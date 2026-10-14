FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Improve npm network resilience inside the container (retries / timeouts)
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 10 \
 && npm config set fetch-retry-maxtimeout 60000 \
 && npm config set fetch-retry-mintimeout 1000 \
 && npm ci --legacy-peer-deps

# Copier tout le code source (y compris prisma/schema.prisma)
COPY . .

# S'assurer qu'aucun artefact de compilation incrémentale résiduel n'est présent :
# un *.tsbuildinfo périmé ferait que `tsc --incremental` n'émet aucun fichier.
RUN rm -f *.tsbuildinfo

# Générer le client Prisma (indispensable avant la compilation)
RUN npx prisma generate

# Compiler le projet TypeScript
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# Script de démarrage dédié (nom unique pour ne pas entrer en collision avec le
# "docker-entrypoint.sh" fourni par l'image node, qui existe déjà dans le PATH).
COPY docker-entrypoint.sh /app/start-backend.sh
RUN chmod +x /app/start-backend.sh

EXPOSE 3000

ENTRYPOINT ["/app/start-backend.sh"]