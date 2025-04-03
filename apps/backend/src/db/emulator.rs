use anyhow::Result;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::sqlite::SqlitePool;

#[derive(Debug, Serialize, Deserialize)]
pub struct EmulatorConfig {
    pub name: String,
    pub console_port: u16,
    pub adb_port: u16,
    pub created_at: String,
    pub updated_at: String,
}

pub struct EmulatorDb {
    pool: SqlitePool,
}

impl EmulatorDb {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn init(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS emulators (
                name TEXT PRIMARY KEY,
                console_port INTEGER NOT NULL,
                adb_port INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn save_emulator(&self, config: &EmulatorConfig) -> Result<()> {
        let now = Utc::now().to_rfc3339();
        
        sqlx::query(
            r#"
            INSERT INTO emulators (name, console_port, adb_port, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(name) DO UPDATE SET
                console_port = excluded.console_port,
                adb_port = excluded.adb_port,
                updated_at = excluded.updated_at
            "#,
        )
        .bind(&config.name)
        .bind(config.console_port)
        .bind(config.adb_port)
        .bind(&now)
        .bind(&now)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_emulator(&self, name: &str) -> Result<Option<EmulatorConfig>> {
        let config = sqlx::query_as!(
            EmulatorConfig,
            r#"
            SELECT name, console_port, adb_port, created_at, updated_at
            FROM emulators
            WHERE name = ?
            "#,
            name
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(config)
    }

    pub async fn list_emulators(&self) -> Result<Vec<EmulatorConfig>> {
        let configs = sqlx::query_as!(
            EmulatorConfig,
            r#"
            SELECT name, console_port, adb_port, created_at, updated_at
            FROM emulators
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(configs)
    }

    pub async fn delete_emulator(&self, name: &str) -> Result<bool> {
        let result = sqlx::query!(
            r#"
            DELETE FROM emulators
            WHERE name = ?
            "#,
            name
        )
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}
