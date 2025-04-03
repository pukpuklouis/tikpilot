use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::emulator::{EmulatorManager, EmulatorError};

pub type SharedEmulatorManager = Arc<Mutex<EmulatorManager>>;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateEmulatorRequest {
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InstallAppRequest {
    apk_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StartAppRequest {
    package_name: String,
    activity: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EmulatorResponse {
    name: String,
    port: u16,
    adb_port: u16,
    status: String,
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    error: String,
}

impl From<EmulatorError> for ErrorResponse {
    fn from(error: EmulatorError) -> Self {
        Self {
            error: error.to_string(),
        }
    }
}

/// Create a new emulator instance
async fn create_emulator(
    manager: web::Data<SharedEmulatorManager>,
    req: web::Json<CreateEmulatorRequest>,
) -> HttpResponse {
    let manager = manager.lock().await;
    match manager.create_emulator(req.name.clone()).await {
        Ok(emulator) => HttpResponse::Ok().json(EmulatorResponse {
            name: req.name.clone(),
            port: emulator.port(),
            adb_port: emulator.adb_port(),
            status: "created".to_string(),
        }),
        Err(e) => HttpResponse::InternalServerError().json(ErrorResponse::from(e)),
    }
}

/// Start an emulator
async fn start_emulator(
    manager: web::Data<SharedEmulatorManager>,
    name: web::Path<String>,
) -> HttpResponse {
    let manager = manager.lock().await;
    match manager.get_emulator(&name).await {
        Some(mut emulator) => match emulator.start().await {
            Ok(_) => HttpResponse::Ok().json(EmulatorResponse {
                name: name.to_string(),
                port: emulator.port(),
                adb_port: emulator.adb_port(),
                status: "running".to_string(),
            }),
            Err(e) => HttpResponse::InternalServerError().json(ErrorResponse::from(e)),
        },
        None => HttpResponse::NotFound().json(ErrorResponse {
            error: format!("Emulator {} not found", name),
        }),
    }
}

/// Stop an emulator
async fn stop_emulator(
    manager: web::Data<SharedEmulatorManager>,
    name: web::Path<String>,
) -> HttpResponse {
    let manager = manager.lock().await;
    match manager.get_emulator(&name).await {
        Some(mut emulator) => match emulator.stop().await {
            Ok(_) => HttpResponse::Ok().json(EmulatorResponse {
                name: name.to_string(),
                port: emulator.port(),
                adb_port: emulator.adb_port(),
                status: "stopped".to_string(),
            }),
            Err(e) => HttpResponse::InternalServerError().json(ErrorResponse::from(e)),
        },
        None => HttpResponse::NotFound().json(ErrorResponse {
            error: format!("Emulator {} not found", name),
        }),
    }
}

/// Install an app on an emulator
async fn install_app(
    manager: web::Data<SharedEmulatorManager>,
    name: web::Path<String>,
    req: web::Json<InstallAppRequest>,
) -> HttpResponse {
    let manager = manager.lock().await;
    match manager.get_emulator(&name).await {
        Some(emulator) => match emulator.install_app(&req.apk_path).await {
            Ok(_) => HttpResponse::Ok().json(()),
            Err(e) => HttpResponse::InternalServerError().json(ErrorResponse::from(e)),
        },
        None => HttpResponse::NotFound().json(ErrorResponse {
            error: format!("Emulator {} not found", name),
        }),
    }
}

/// Start an app on an emulator
async fn start_app(
    manager: web::Data<SharedEmulatorManager>,
    name: web::Path<String>,
    req: web::Json<StartAppRequest>,
) -> HttpResponse {
    let manager = manager.lock().await;
    match manager.get_emulator(&name).await {
        Some(emulator) => match emulator.start_app(&req.package_name, &req.activity).await {
            Ok(_) => HttpResponse::Ok().json(()),
            Err(e) => HttpResponse::InternalServerError().json(ErrorResponse::from(e)),
        },
        None => HttpResponse::NotFound().json(ErrorResponse {
            error: format!("Emulator {} not found", name),
        }),
    }
}

/// Stop an app on an emulator
async fn stop_app(
    manager: web::Data<SharedEmulatorManager>,
    name: web::Path<String>,
    package_name: web::Path<String>,
) -> HttpResponse {
    let manager = manager.lock().await;
    match manager.get_emulator(&name).await {
        Some(emulator) => match emulator.stop_app(&package_name).await {
            Ok(_) => HttpResponse::Ok().json(()),
            Err(e) => HttpResponse::InternalServerError().json(ErrorResponse::from(e)),
        },
        None => HttpResponse::NotFound().json(ErrorResponse {
            error: format!("Emulator {} not found", name),
        }),
    }
}

/// Get emulator status
async fn get_emulator_status(
    manager: web::Data<SharedEmulatorManager>,
    name: web::Path<String>,
) -> HttpResponse {
    let manager = manager.lock().await;
    match manager.get_emulator(&name).await {
        Some(emulator) => HttpResponse::Ok().json(EmulatorResponse {
            name: name.to_string(),
            port: emulator.port(),
            adb_port: emulator.adb_port(),
            status: if emulator.is_running().await.unwrap_or(false) {
                "running"
            } else {
                "stopped"
            }
            .to_string(),
        }),
        None => HttpResponse::NotFound().json(ErrorResponse {
            error: format!("Emulator {} not found", name),
        }),
    }
}

/// Configure emulator management API routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/emulators")
            .route("", web::post().to(create_emulator))
            .route("/{name}/start", web::post().to(start_emulator))
            .route("/{name}/stop", web::post().to(stop_emulator))
            .route("/{name}/status", web::get().to(get_emulator_status))
            .route("/{name}/apps/install", web::post().to(install_app))
            .route("/{name}/apps/{package}/start", web::post().to(start_app))
            .route("/{name}/apps/{package}/stop", web::post().to(stop_app))
    );
}
