# ── RecycleNow Backend — Production Dockerfile ──
# Node 20 Alpine (LTS through April 2026, lightweight ~150MB)

FROM node:20-alpine

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json* ./

# Install production dependencies only (no devDependencies)
RUN npm ci --omit=dev

# Copy source code
COPY src/ ./src/

# Copy service account key (required by firebaseAdmin.js and visionAI.js)
# Path resolves to /app/service-account-key.json from src/config/
COPY service-account-key.json ./

# Cloud Run injects PORT=8080 automatically
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Start the Express server
CMD ["node", "src/server.js"]
