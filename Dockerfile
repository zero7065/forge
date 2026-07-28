FROM node:20-alpine AS base
WORKDIR /app

# Build stage
FROM base AS build
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS production
RUN addgroup -g 1001 -S forge && adduser -S forge -u 1001 -G forge
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server ./server
COPY --from=build /app/tsconfig.json ./

USER forge
RUN mkdir -p data uploads && chown -R forge:forge data uploads

EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "--import=tsx", "server/index.js"]
