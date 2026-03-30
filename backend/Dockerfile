# Stage 1: Build environment
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools. Since we are using Alpine (musl), better-sqlite3 may need to compile from source.
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# Copy the built application from the builder stage
# This keeps the final image lightweight and free of build tools and OS vulnerabilities
COPY --from=builder /app ./

# Expose the port your backend uses (assumed 5000 or 3000, please change if different in your code)
EXPOSE 5000

CMD ["node", "server.js"]
