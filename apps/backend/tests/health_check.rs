use actix_web::{test, App};
use backend::routes;

#[actix_web::test]
async fn test_health_check() {
    // Arrange
    let app = test::init_service(
        App::new().configure(routes::configure_routes)
    ).await;
    
    // Act
    let req = test::TestRequest::get().uri("/health").to_request();
    let resp = test::call_service(&app, req).await;
    
    // Assert
    assert!(resp.status().is_success());
    
    let body = test::read_body(resp).await;
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    
    assert_eq!(json["status"], "ok");
    assert_eq!(json["message"], "Service is running");
}
