use actix_web::{middleware, App, HttpServer, web};
use anyhow::Result;
use dotenv::dotenv;
use log::info;
use std::sync::Arc;
use tokio::sync::Mutex;

use backend::{
    config,
    db,
    emulator::EmulatorManager,
    handlers,
    routes,
};

#[actix_web::main]
async fn main() -> Result<()> {
    // Initialize environment
    dotenv().ok();
    env_logger::init();

    // Load configuration
    let config = config::load()?;
    info!("Configuration loaded");

    // Initialize database connection
    let db_pool = db::create_pool(&config.database.url).await?;
    info!("Database connection established");
    
    // Initialize the emulator manager
    let emulator_manager = Arc::new(Mutex::new(EmulatorManager::new(db_pool.clone())));
    
    // Create and start the HTTP server
    let server_config = config.server.clone();
    info!("Starting server at {}:{}", server_config.host, server_config.port);
    HttpServer::new(move || {
        App::new()
            // Add database pool to app state
            .app_data(web::Data::new(db_pool.clone()))
            // Add emulator manager to app state
            .app_data(web::Data::new(emulator_manager.clone()))
            // Enable logger middleware
            .wrap(middleware::Logger::default())
            // Configure routes
            .configure(routes::configure)
            // Configure emulator API routes
            .configure(handlers::emulator::configure)
    })
    .bind((server_config.host, server_config.port))?
    .run()
    .await?;

    Ok(())
}
