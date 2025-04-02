# TikPilot Backend

A Rust-based backend service built with Actix Web for the TikPilot application.

## Project Structure

```
backend/
├── config/             # Configuration files
│   └── default.toml    # Default configuration
├── src/
│   ├── config/         # Configuration handling
│   ├── db/             # Database connection and queries
│   ├── handlers/       # Request handlers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   └── main.rs         # Application entry point
└── Cargo.toml          # Project dependencies
```

## Features

- Actix Web framework for high-performance HTTP server
- SQLite database for storing account configurations
- Environment-based configuration
- Structured logging
- Health check endpoint

## Getting Started

### Prerequisites

- Rust and Cargo (latest stable version)

### Running the Application

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Build and run the application:
   ```
   cargo run
   ```

The server will start at `http://127.0.0.1:8080` by default.

### API Endpoints

- `GET /health` - Health check endpoint

## Development

### Environment Variables

You can configure the application using environment variables with the prefix `APP__`:

- `APP__SERVER__HOST` - Server host (default: 127.0.0.1)
- `APP__SERVER__PORT` - Server port (default: 8080)
- `APP__DATABASE__URL` - Database URL (default: sqlite:tikpilot.db)

### Running Tests

```
cargo test
```
