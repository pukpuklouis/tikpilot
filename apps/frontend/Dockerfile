# Build stage
FROM node:20-slim as builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:20-slim

WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy build output and public files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
