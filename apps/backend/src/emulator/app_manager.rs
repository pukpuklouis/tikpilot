use std::path::Path;
use tokio::process::Command as TokioCommand;
use thiserror::Error;
use log::{info, error};

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Failed to install app: {0}")]
    InstallError(String),
    #[error("Failed to uninstall app: {0}")]
    UninstallError(String),
    #[error("Failed to start app: {0}")]
    StartError(String),
    #[error("Failed to stop app: {0}")]
    StopError(String),
    #[error("Failed to check app status: {0}")]
    StatusError(String),
    #[error("Invalid APK path: {0}")]
    InvalidApkPath(String),
}

/// Manages application installation and control on an emulator
#[derive(Debug)]
pub struct AppManager {
    device_id: String,
}

impl AppManager {
    pub fn new(device_id: String) -> Self {
        Self { device_id }
    }

    /// Install an APK file on the emulator
    pub async fn install_app<P: AsRef<Path>>(&self, apk_path: P) -> Result<(), AppError> {
        let apk_path = apk_path.as_ref().to_str().ok_or_else(|| {
            AppError::InvalidApkPath("APK path contains invalid characters".to_string())
        })?;

        info!("Installing app from {}", apk_path);
        
        let output = TokioCommand::new("adb")
            .arg("-s")
            .arg(&self.device_id)
            .arg("install")
            .arg("-r")  // Replace existing application
            .arg(apk_path)
            .output()
            .await
            .map_err(|e| AppError::InstallError(e.to_string()))?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            error!("Failed to install app: {}", error);
            return Err(AppError::InstallError(error.to_string()));
        }

        info!("Successfully installed app from {}", apk_path);
        Ok(())
    }

    /// Uninstall an app from the emulator
    pub async fn uninstall_app(&self, package_name: &str) -> Result<(), AppError> {
        info!("Uninstalling app {}", package_name);
        
        let output = TokioCommand::new("adb")
            .arg("-s")
            .arg(&self.device_id)
            .arg("uninstall")
            .arg(package_name)
            .output()
            .await
            .map_err(|e| AppError::UninstallError(e.to_string()))?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            error!("Failed to uninstall app: {}", error);
            return Err(AppError::UninstallError(error.to_string()));
        }

        info!("Successfully uninstalled app {}", package_name);
        Ok(())
    }

    /// Start an app on the emulator
    pub async fn start_app(&self, package_name: &str, activity: &str) -> Result<(), AppError> {
        info!("Starting app {}/{}", package_name, activity);
        
        let output = TokioCommand::new("adb")
            .arg("-s")
            .arg(&self.device_id)
            .arg("shell")
            .arg("am")
            .arg("start")
            .arg("-n")
            .arg(format!("{}/{}", package_name, activity))
            .output()
            .await
            .map_err(|e| AppError::StartError(e.to_string()))?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            error!("Failed to start app: {}", error);
            return Err(AppError::StartError(error.to_string()));
        }

        info!("Successfully started app {}", package_name);
        Ok(())
    }

    /// Stop an app on the emulator
    pub async fn stop_app(&self, package_name: &str) -> Result<(), AppError> {
        info!("Stopping app {}", package_name);
        
        let output = TokioCommand::new("adb")
            .arg("-s")
            .arg(&self.device_id)
            .arg("shell")
            .arg("am")
            .arg("force-stop")
            .arg(package_name)
            .output()
            .await
            .map_err(|e| AppError::StopError(e.to_string()))?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            error!("Failed to stop app: {}", error);
            return Err(AppError::StopError(error.to_string()));
        }

        info!("Successfully stopped app {}", package_name);
        Ok(())
    }

    /// Check if an app is currently running
    pub async fn is_app_running(&self, package_name: &str) -> Result<bool, AppError> {
        let output = TokioCommand::new("adb")
            .arg("-s")
            .arg(&self.device_id)
            .arg("shell")
            .arg("ps")
            .arg("|")
            .arg("grep")
            .arg(package_name)
            .output()
            .await
            .map_err(|e| AppError::StatusError(e.to_string()))?;

        Ok(!String::from_utf8_lossy(&output.stdout).trim().is_empty())
    }

    /// Get the version of an installed app
    pub async fn get_app_version(&self, package_name: &str) -> Result<String, AppError> {
        let output = TokioCommand::new("adb")
            .arg("-s")
            .arg(&self.device_id)
            .arg("shell")
            .arg("dumpsys")
            .arg("package")
            .arg(package_name)
            .arg("|")
            .arg("grep")
            .arg("versionName")
            .output()
            .await
            .map_err(|e| AppError::StatusError(e.to_string()))?;

        let version = String::from_utf8_lossy(&output.stdout)
            .lines()
            .next()
            .and_then(|line| line.split('=').nth(1))
            .map(|v| v.trim().to_string())
            .ok_or_else(|| AppError::StatusError("Failed to parse app version".to_string()))?;

        Ok(version)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::test;

    #[test]
    async fn test_app_manager_creation() {
        let manager = AppManager::new("emulator-5554".to_string());
        assert_eq!(manager.device_id, "emulator-5554");
    }

    // Note: Additional integration tests would require actual APK files and running emulator
}
