# Use Node.js as base image
FROM node:20-slim

# Install required dependencies for Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    libgconf-2-4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy workspace files
COPY ../../package.json ../../pnpm-workspace.yaml ../../pnpm-lock.yaml ./
COPY ../../apps/playwright-service/package.json ./apps/playwright-service/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Install Playwright browsers
RUN pnpm exec playwright install chromium

# Copy source code
COPY ../../apps/playwright-service ./apps/playwright-service

# Build TypeScript code
WORKDIR /app/apps/playwright-service
RUN pnpm build

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the service
CMD ["pnpm", "start"]
