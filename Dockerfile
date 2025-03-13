FROM node:22-alpine AS base
WORKDIR /app


# install prod dependencies

FROM base AS deps
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm fetch && pnpm install --frozen-lockfile --prod --offline


# install all dependencies and build typescript

FROM deps AS ts-builder
RUN pnpm install --frozen-lockfile --offline

COPY tsconfig.json ./
COPY ./src ./src
RUN pnpm run build


# production image

FROM base
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json .
COPY --from=ts-builder /app/build ./build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
