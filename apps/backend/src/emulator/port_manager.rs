use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use thiserror::Error;

const MIN_PORT: u16 = 5554;
const MAX_PORT: u16 = 5584;  // Supports up to 15 emulator instances (each uses 2 ports)
const PORT_INCREMENT: u16 = 2;  // Emulator uses consecutive ports for console and adb

#[derive(Error, Debug)]
pub enum PortError {
    #[error("No available ports in the valid range")]
    NoAvailablePorts,
    #[error("Port {0} is already in use")]
    PortInUse(u16),
    #[error("Invalid port {0}: must be even and between {MIN_PORT} and {MAX_PORT}")]
    InvalidPort(u16),
}

/// Manages port allocation for multiple emulator instances
#[derive(Debug, Default)]
pub struct PortManager {
    allocated_ports: HashMap<String, u16>,  // Maps emulator name to console port
}

impl PortManager {
    pub fn new() -> Self {
        Self {
            allocated_ports: HashMap::new(),
        }
    }

    /// Allocate a port pair for a new emulator instance
    pub fn allocate_ports(&mut self, emulator_name: &str) -> Result<(u16, u16), PortError> {
        // Check if emulator already has ports allocated
        if let Some(&console_port) = self.allocated_ports.get(emulator_name) {
            return Ok((console_port, console_port + 1));
        }

        // Find first available port pair
        let mut port = MIN_PORT;
        while port <= MAX_PORT {
            if !self.is_port_in_use(port) {
                self.allocated_ports.insert(emulator_name.to_string(), port);
                return Ok((port, port + 1));
            }
            port += PORT_INCREMENT;
        }

        Err(PortError::NoAvailablePorts)
    }

    /// Release ports allocated to an emulator
    pub fn release_ports(&mut self, emulator_name: &str) {
        self.allocated_ports.remove(emulator_name);
    }

    /// Check if a port is currently in use
    fn is_port_in_use(&self, port: u16) -> bool {
        self.allocated_ports.values().any(|&p| p == port)
    }

    /// Get the ports for an emulator if allocated
    pub fn get_ports(&self, emulator_name: &str) -> Option<(u16, u16)> {
        self.allocated_ports
            .get(emulator_name)
            .map(|&console_port| (console_port, console_port + 1))
    }

    /// Validate if a port is in the valid range and even
    pub fn validate_port(&self, port: u16) -> Result<(), PortError> {
        if port < MIN_PORT || port > MAX_PORT || port % 2 != 0 {
            return Err(PortError::InvalidPort(port));
        }
        Ok(())
    }
}

/// Thread-safe wrapper for PortManager
#[derive(Debug, Default, Clone)]
pub struct SharedPortManager(Arc<Mutex<PortManager>>);

impl SharedPortManager {
    pub fn new() -> Self {
        Self(Arc::new(Mutex::new(PortManager::new())))
    }

    pub async fn allocate_ports(&self, emulator_name: &str) -> Result<(u16, u16), PortError> {
        let mut manager = self.0.lock().await;
        manager.allocate_ports(emulator_name)
    }

    pub async fn release_ports(&self, emulator_name: &str) {
        let mut manager = self.0.lock().await;
        manager.release_ports(emulator_name)
    }

    pub async fn get_ports(&self, emulator_name: &str) -> Option<(u16, u16)> {
        let manager = self.0.lock().await;
        manager.get_ports(emulator_name)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::test;

    #[test]
    async fn test_port_allocation() {
        let manager = SharedPortManager::new();
        
        // Test successful allocation
        let (console_port, adb_port) = manager.allocate_ports("test_emu1").await.unwrap();
        assert_eq!(console_port, MIN_PORT);
        assert_eq!(adb_port, MIN_PORT + 1);

        // Test second allocation gets next available ports
        let (console_port2, adb_port2) = manager.allocate_ports("test_emu2").await.unwrap();
        assert_eq!(console_port2, MIN_PORT + 2);
        assert_eq!(adb_port2, MIN_PORT + 3);

        // Test port release
        manager.release_ports("test_emu1").await;
        let (console_port3, adb_port3) = manager.allocate_ports("test_emu3").await.unwrap();
        assert_eq!(console_port3, MIN_PORT);  // Should reuse released ports
        assert_eq!(adb_port3, MIN_PORT + 1);
    }

    #[test]
    async fn test_port_reuse() {
        let manager = SharedPortManager::new();
        
        // Allocate ports for same emulator twice
        let ports1 = manager.allocate_ports("test_emu").await.unwrap();
        let ports2 = manager.allocate_ports("test_emu").await.unwrap();
        
        // Should return same ports
        assert_eq!(ports1, ports2);
    }
}
