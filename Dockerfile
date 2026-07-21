# Dockerfile for Thatworkx AEO Suite Staging/Production Deployment
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy dependency configs
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy backend and frontend source files
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY vitest.config.js ./

# Set environment defaults (can be overridden by DigitalOcean)
ENV NODE_ENV=staging
ENV PORT=5000

# Expose server port
EXPOSE 5000

# Run Express server
CMD ["node", "backend/server.js"]
