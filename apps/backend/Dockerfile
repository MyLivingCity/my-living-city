FROM node:22-bullseye-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /tmp

# ---
FROM base AS prepare

RUN pnpm --global add turbo@^2

COPY . .
RUN turbo prune @mlc/backend --docker

# ---
FROM base AS runner

WORKDIR /opt/mlc

COPY --from=prepare /tmp/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -r --prefer-frozen-lockfile

COPY --from=prepare /tmp/out/full/ .
COPY ./apps/backend/.env ./apps/backend/.env

RUN pnpm --filter @mlc/backend exec prisma generate

CMD ["pnpm", "run", "--filter", "@mlc/backend", "dev"]
