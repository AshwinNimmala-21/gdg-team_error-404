# Clearlease on Cloud Run: multi-stage build of the Next.js standalone server.
# Secrets are NOT baked in: they arrive at runtime from Secret Manager (--set-secrets).

FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:24-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `postbuild` copies public/ and .next/static/ into .next/standalone/.
RUN npm run build

FROM node:24-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=8080
COPY --from=build --chown=node:node /app/.next/standalone ./
USER node
EXPOSE 8080
CMD ["node", "server.js"]
