pub mod health;

pub fn configure_routes(cfg: &mut actix_web::web::ServiceConfig) {
    health::configure_routes(cfg);
}

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    // Add other route configurations here as needed
    cfg.service(web::scope("/api"));
}
