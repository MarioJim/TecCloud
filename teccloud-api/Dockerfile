# deps container
FROM node:16-bullseye-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# runner container
FROM node:16-bullseye-slim AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
ENV PORT 3001
CMD ["yarn", "start"]
