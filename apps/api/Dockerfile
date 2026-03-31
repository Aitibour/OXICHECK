# =============================================================================
# HotelCheckIn API — Multi-stage Dockerfile
# =============================================================================

# --- Stage 1: Install dependencies ---
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

RUN pnpm install --frozen-lockfile

# --- Stage 2: Build ---
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules

COPY . .

RUN pnpm --filter @hotelcheckin/shared build
RUN pnpm --filter @hotelcheckin/api build

# --- Stage 3: Production ---
FROM node:20-alpine AS production
RUN corepack enable

ENV NODE_ENV=production
WORKDIR /app

# Copy built output and production dependencies
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@hotelcheckin/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@hotelcheckin/shared/package.json

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
