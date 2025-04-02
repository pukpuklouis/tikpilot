use anyhow::Result;
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::path::Path;
use std::fs;

pub async fn create_pool(database_url: &str) -> Result<SqlitePool> {
    // Extract the path from the SQLite URL
    let path = database_url.strip_prefix("sqlite:").unwrap_or(database_url);
    
    // Ensure the directory exists
    if let Some(parent) = Path::new(path).parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }
    
    // Create the pool with connection options that ensure the database file is created
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;
    
    // Initialize the database schema if needed
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        "#
    )
    .execute(&pool)
    .await?;
    
    Ok(pool)
}
