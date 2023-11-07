# Installation
FROM node:18.18.2-bookworm-slim AS deps
RUN apt-get install -y --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


# Build
FROM node:18.18.2-bookworm-slim AS builder

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build && npm install --production --ignore-scripts --prefer-offline

# Runner
FROM node:18.18.2-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -pv ./config

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/env.mjs ./src/env.mjs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED 1

CMD [ "npm", "run", "start" ]