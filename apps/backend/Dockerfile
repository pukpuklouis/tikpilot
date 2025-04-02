# Build stage
FROM rust:1.81-slim-bookworm as builder

WORKDIR /usr/src/app

# Install build dependencies and cargo-watch
RUN apt-get update && \
    apt-get install -y --no-install-recommends pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/* && \
    cargo install cargo-watch

# Copy source code
COPY . .

# Build application
RUN cargo build --release

# Create data directory, create database file, and set permissions
RUN mkdir -p /usr/src/app/data && \
    touch /usr/src/app/data/tikpilot.db && \
    chmod -R 777 /usr/src/app/data

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    pkg-config \
    libssl-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy binary and data directory from builder
COPY --from=builder /usr/src/app/target/release/backend ./
COPY --from=builder /usr/src/app/data ./data

# Set permissions
RUN chmod +x backend

# Expose port
EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://0.0.0.0:8080/health || exit 1

# Run the binary
CMD ["./backend"]
