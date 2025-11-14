# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Sharp and curl for health check
RUN apk add --no-cache \
    libc6-compat \
    vips-dev \
    curl

# Copy package files
COPY package*.json ./

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/image-compression/health || exit 1

# Start the application
CMD ["npm", "run", "start"]