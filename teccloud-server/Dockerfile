# deps container
FROM node:16-bullseye-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# builder container
FROM node:16-bullseye-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN yarn build

# runner container
FROM node:16-bullseye-slim AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
