FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS deps-prod
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS build
ARG VITE_SITE_URL=
ENV VITE_SITE_URL=$VITE_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runtime
RUN apk add --no-cache curl
COPY --from=build /app/.output ./.output
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/scripts ./scripts

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "node scripts/run-migrations.mjs && node .output/server/index.mjs"]
