FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Improve npm network resilience inside the container (retries / timeouts)
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 10 \
 && npm config set fetch-retry-maxtimeout 60000 \
 && npm config set fetch-retry-mintimeout 1000 \
 && npm ci --legacy-peer-deps

# Copier tout le code source
COPY . .

# Compiler le projet TypeScript
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Applique les migrations TypeORM puis demarre l'API.
# Le DataSource compile (dist) est utilise : aucune dependance a ts-node.
CMD ["sh", "-c", "npx typeorm migration:run -d dist/database/data-source.js && node dist/main"]
