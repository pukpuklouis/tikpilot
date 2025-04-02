use actix_web::{middleware, App, HttpServer};
use anyhow::Result;
use dotenv::dotenv;
use log::info;

mod config;
mod routes;
mod handlers;
mod models;
mod db;

#[actix_web::main]
async fn main() -> Result<()> {
    // Load .env file if present
    dotenv().ok();
    
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    // Load configuration
    let config = config::Settings::new()?;
    info!("Configuration loaded successfully");
    
    // Create database pool
    let db_pool = db::create_pool(&config.database.url).await?;
    info!("Database connection established");
    
    // Create and start the HTTP server
    let server_config = config.server.clone();
    info!("Starting server at {}:{}", server_config.host, server_config.port);
    
    HttpServer::new(move || {
        App::new()
            // Add database pool to app state
            .app_data(actix_web::web::Data::new(db_pool.clone()))
            // Enable logger middleware
            .wrap(middleware::Logger::default())
            // Configure routes
            .configure(routes::configure_routes)
    })
    .bind((server_config.host, server_config.port))?
    .run()
    .await?;
    
    Ok(())
}
