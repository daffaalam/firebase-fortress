# Dockerfile

# Base image
FROM node:lts-alpine AS base
WORKDIR /app

# Builder image
FROM base AS builder

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Ensure public directory exists to prevent copy errors later
RUN if [ ! -d "public" ]; then mkdir "public"; fi

# Build the application
RUN npm run build

# Runner image
FROM base AS runner
WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose port and start server
EXPOSE 3000
CMD ["node", "server.js"]
