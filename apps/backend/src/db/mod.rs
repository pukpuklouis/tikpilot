use anyhow::Result;
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::path::Path;
use std::fs;

pub mod emulator;
pub use emulator::EmulatorDb;

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
    let emulator_db = EmulatorDb::new(pool.clone());
    emulator_db.init().await?;
    
    Ok(pool)
}
