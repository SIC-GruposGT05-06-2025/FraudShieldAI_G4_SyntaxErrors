# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies for build
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build the Next.js app
COPY . .
RUN npm run build


# ---- Production stage ----
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy only package manifests then install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --production --silent --no-audit --no-fund

# Copy built assets and public files from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application (use npm because package.json defines `start`)
CMD ["npm", "start"]
