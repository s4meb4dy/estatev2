FROM node:22-alpine AS deps

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /data/uploads \
    && chown -R app:app /data

COPY --from=deps /app/node_modules ./node_modules
COPY server/package.json ./server/package.json
COPY server/src ./server/src
COPY server/scripts ./server/scripts
COPY server/drizzle ./server/drizzle
COPY shared ./shared
COPY src/data ./src/data

USER app
WORKDIR /app/server

EXPOSE 3000

CMD ["node", "src/index.js"]
