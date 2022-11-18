# deps container
FROM node:16-bullseye-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . .
RUN yarn build

# runner container
FROM node:16-bullseye-slim
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/dist ./dist
EXPOSE 3001
ENV PORT 3001
CMD ["yarn", "start"]
