use tokio::process::Command as TokioCommand;
use thiserror::Error;
use anyhow::Result;
use log::{info, error};
use sqlx::sqlite::SqlitePool;

mod port_manager;
mod app_manager;

use port_manager::{SharedPortManager, PortError};
use app_manager::{AppManager, AppError};
use std::path::Path;
use crate::db::EmulatorDb;

#[derive(Error, Debug)]
pub enum EmulatorError {
    #[error("Failed to start emulator: {0}")]
    StartError(String),
    #[error("Failed to stop emulator: {0}")]
    StopError(String),
    #[error("Failed to check emulator status: {0}")]
    StatusCheckError(String),
    #[error("ADB command failed: {0}")]
    AdbError(String),
    #[error("Port error: {0}")]
    PortError(#[from] PortError),
    #[error("App error: {0}")]
    AppError(#[from] AppError),
    #[error("Database error: {0}")]
    DbError(#[from] sqlx::Error),
}

/// Manages multiple emulator instances
#[derive(Clone)]
pub struct EmulatorManager {
    port_manager: SharedPortManager,
    db: EmulatorDb,
}

impl EmulatorManager {
    pub fn new(pool: SqlitePool) -> Self {
        Self {
            port_manager: SharedPortManager::new(),
            db: EmulatorDb::new(pool),
        }
    }

    /// Create a new emulator instance with automatic port allocation
    pub async fn create_emulator(&self, name: String) -> Result<Emulator, EmulatorError> {
        let (console_port, _) = self.port_manager.allocate_ports(&name).await?;
        
        // Create emulator instance
        let emulator = Emulator::new(name.clone(), console_port, self.port_manager.clone());
        
        // Save to database
        self.db.save_emulator(&emulator.to_config()).await?;
        
        Ok(emulator)
    }

    /// Get an emulator instance by name
    pub async fn get_emulator(&self, name: &str) -> Option<Emulator> {
        if let Ok(Some(config)) = self.db.get_emulator(name).await {
            Some(Emulator::from_config(config, self.port_manager.clone()))
        } else {
            None
        }
    }

    /// List all emulators
    pub async fn list_emulators(&self) -> Result<Vec<Emulator>, EmulatorError> {
        let configs = self.db.list_emulators().await?;
        Ok(configs.into_iter()
            .map(|config| Emulator::from_config(config, self.port_manager.clone()))
            .collect())
    }
}

/// Represents an Android emulator instance
pub struct Emulator {
    name: String,
    port: u16,
    adb_port: u16,
    port_manager: SharedPortManager,
    app_manager: Option<AppManager>,
}

impl Emulator {
    fn new(name: String, port: u16, port_manager: SharedPortManager) -> Self {
        Self {
            name,
            port,
            adb_port: port + 1,
            port_manager,
            app_manager: None,
        }
    }

    fn from_config(config: crate::db::emulator::EmulatorConfig, port_manager: SharedPortManager) -> Self {
        Self {
            name: config.name,
            port: config.console_port,
            adb_port: config.adb_port,
            port_manager,
            app_manager: None,
        }
    }

    fn to_config(&self) -> crate::db::emulator::EmulatorConfig {
        crate::db::emulator::EmulatorConfig {
            name: self.name.clone(),
            console_port: self.port,
            adb_port: self.adb_port,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    }

    /// Get the emulator's console port
    pub fn port(&self) -> u16 {
        self.port
    }

    /// Get the emulator's ADB port
    pub fn adb_port(&self) -> u16 {
        self.adb_port
    }

    /// Start the emulator instance
    pub async fn start(&mut self) -> Result<(), EmulatorError> {
        info!("Starting emulator {} on port {}", self.name, self.port);
        
        let output = TokioCommand::new("emulator")
            .arg("-avd")
            .arg(&self.name)
            .arg("-port")
            .arg(self.port.to_string())
            .arg("-no-window")  // Run headless
            .output()
            .await
            .map_err(|e| EmulatorError::StartError(e.to_string()))?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            error!("Failed to start emulator: {}", error);
            return Err(EmulatorError::StartError(error.to_string()));
        }

        // Initialize app manager after emulator is started
        self.app_manager = Some(AppManager::new(format!("emulator-{}", self.port)));
        info!("Successfully started emulator {}", self.name);
        Ok(())
    }

    /// Stop the emulator instance and release its ports
    pub async fn stop(&mut self) -> Result<(), EmulatorError> {
        info!("Stopping emulator {}", self.name);
        
        let output = TokioCommand::new("adb")
            .arg("-s")
            .arg(format!("emulator-{}", self.port))
            .arg("emu")
            .arg("kill")
            .output()
            .await
            .map_err(|e| EmulatorError::StopError(e.to_string()))?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            error!("Failed to stop emulator: {}", error);
            return Err(EmulatorError::StopError(error.to_string()));
        }

        // Release the ports
        self.port_manager.release_ports(&self.name).await;
        info!("Successfully stopped emulator {}", self.name);
        Ok(())
    }

    /// Check if the emulator is running
    pub async fn is_running(&self) -> Result<bool, EmulatorError> {
        let output = TokioCommand::new("adb")
            .arg("devices")
            .output()
            .await
            .map_err(|e| EmulatorError::StatusCheckError(e.to_string()))?;

        let devices = String::from_utf8_lossy(&output.stdout);
        Ok(devices.contains(&format!("emulator-{}", self.port)))
    }

    /// Execute an ADB command on the emulator
    pub async fn adb_command(&self, args: &[&str]) -> Result<String, EmulatorError> {
        let mut command = TokioCommand::new("adb");
        command
            .arg("-s")
            .arg(format!("emulator-{}", self.port));
        
        for arg in args {
            command.arg(arg);
        }

        let output = command
            .output()
            .await
            .map_err(|e| EmulatorError::AdbError(e.to_string()))?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            return Err(EmulatorError::AdbError(error.to_string()));
        }

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }

    /// Install an application on the emulator
    pub async fn install_app<P: AsRef<Path>>(&self, apk_path: P) -> Result<(), EmulatorError> {
        let app_manager = self.app_manager.as_ref()
            .ok_or_else(|| EmulatorError::StartError("Emulator not started".to_string()))?;
        Ok(app_manager.install_app(apk_path).await?)
    }

    /// Uninstall an application from the emulator
    pub async fn uninstall_app(&self, package_name: &str) -> Result<(), EmulatorError> {
        let app_manager = self.app_manager.as_ref()
            .ok_or_else(|| EmulatorError::StartError("Emulator not started".to_string()))?;
        Ok(app_manager.uninstall_app(package_name).await?)
    }

    /// Start an application on the emulator
    pub async fn start_app(&self, package_name: &str, activity: &str) -> Result<(), EmulatorError> {
        let app_manager = self.app_manager.as_ref()
            .ok_or_else(|| EmulatorError::StartError("Emulator not started".to_string()))?;
        Ok(app_manager.start_app(package_name, activity).await?)
    }

    /// Stop an application on the emulator
    pub async fn stop_app(&self, package_name: &str) -> Result<(), EmulatorError> {
        let app_manager = self.app_manager.as_ref()
            .ok_or_else(|| EmulatorError::StartError("Emulator not started".to_string()))?;
        Ok(app_manager.stop_app(package_name).await?)
    }

    /// Check if an application is running on the emulator
    pub async fn is_app_running(&self, package_name: &str) -> Result<bool, EmulatorError> {
        let app_manager = self.app_manager.as_ref()
            .ok_or_else(|| EmulatorError::StartError("Emulator not started".to_string()))?;
        Ok(app_manager.is_app_running(package_name).await?)
    }

    /// Get the version of an installed application
    pub async fn get_app_version(&self, package_name: &str) -> Result<String, EmulatorError> {
        let app_manager = self.app_manager.as_ref()
            .ok_or_else(|| EmulatorError::StartError("Emulator not started".to_string()))?;
        Ok(app_manager.get_app_version(package_name).await?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::test;

    #[test]
    async fn test_emulator_manager() {
        let manager = EmulatorManager::new(SqlitePool::connect("sqlite::memory:").await.unwrap());
        
        // Create first emulator
        let emu1 = manager.create_emulator("test_avd1".to_string()).await.unwrap();
        assert_eq!(emu1.name, "test_avd1");
        assert_eq!(emu1.port, 5554);
        assert_eq!(emu1.adb_port, 5555);

        // Create second emulator
        let emu2 = manager.create_emulator("test_avd2".to_string()).await.unwrap();
        assert_eq!(emu2.name, "test_avd2");
        assert_eq!(emu2.port, 5556);
        assert_eq!(emu2.adb_port, 5557);
    }

    #[test]
    async fn test_emulator_creation() {
        let manager = EmulatorManager::new(SqlitePool::connect("sqlite::memory:").await.unwrap());
        let emu = manager.create_emulator("test_avd".to_string()).await.unwrap();
        assert_eq!(emu.name, "test_avd");
    }
}
