pub mod health;

pub fn configure_routes(cfg: &mut actix_web::web::ServiceConfig) {
    health::configure_routes(cfg);
}
