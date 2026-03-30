FROM node:20-alpine AS builder

# Alpine doesn't have apt-get, but we install libc6-compat for some Next.js optimization libraries
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# If you don't use output: 'standalone' in next.config.mjs, you can use the simpler setup below instead:
# COPY --from=builder /app/next.config.mjs ./
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json
# CMD ["npm", "start"]

EXPOSE 3000
CMD ["node", "server.js"]
