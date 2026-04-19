FROM node:24 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /tmp

# ---
FROM base AS prepare

RUN pnpm --global add turbo@^2

COPY . .
RUN turbo prune @mlc/frontend --docker

# ---
FROM base AS runner

WORKDIR /opt/mlc

COPY --from=prepare /tmp/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -r --prefer-frozen-lockfile

COPY --from=prepare /tmp/out/full/ .

EXPOSE 5173
CMD ["pnpm", "run", "--filter", "@mlc/frontend", "dev", "--host"]
