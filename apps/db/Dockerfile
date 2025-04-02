FROM alpine:latest

RUN apk add --no-cache sqlite

WORKDIR /data

# Create data directory and set permissions
RUN mkdir -p /data && chown -R nobody:nobody /data

# Switch to non-root user
USER nobody

# Initialize database and keep container running
CMD sqlite3 /data/tikpilot.db ".databases" && tail -f /dev/null
