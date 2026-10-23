FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Improve npm network resilience inside the container (retries / timeouts)
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 10 \
 && npm config set fetch-retry-maxtimeout 60000 \
 && npm config set fetch-retry-mintimeout 1000 \
 && npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Cible utilisée par docker-compose : le code source est monté et Nest le
# recompile à chaud. Les nouvelles routes backend ne restent ainsi jamais
# masquées derrière une ancienne image `dist`.
FROM builder AS development
CMD ["sh", "-c", "npm run migration:run && npm run start:dev"]

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Applique les migrations TypeORM puis demarre l'API.
# Le DataSource compile (dist) est utilise : aucune dependance a ts-node.
CMD ["sh", "-c", "npx typeorm migration:run -d dist/database/data-source.js && node dist/main"]
