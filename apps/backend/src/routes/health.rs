use actix_web::{get, web, HttpResponse, Responder};

#[get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "message": "Service is running"
    }))
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(health_check);
}
