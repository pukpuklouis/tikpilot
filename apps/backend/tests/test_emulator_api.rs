use actix_web::{test, web, App};
use anyhow::Result;
use sqlx::sqlite::SqlitePool;
use std::sync::Arc;
use tikpilot_backend::{
    config::Config,
    db,
    emulator::EmulatorManager,
    handlers::emulator::{CreateEmulatorRequest, EmulatorResponse},
    routes,
};

async fn setup_test_app() -> Result<(
    test::TestApp,
    Arc<EmulatorManager>,
)> {
    // Create in-memory SQLite database
    let pool = SqlitePool::connect("sqlite::memory:").await?;
    db::create_pool("sqlite::memory:").await?;

    // Create emulator manager
    let emulator_manager = Arc::new(EmulatorManager::new(pool.clone()));

    // Create test application
    let app = test::init_service(
        App::new()
            .app_data(web::Data::new(emulator_manager.clone()))
            .configure(routes::configure),
    )
    .await;

    Ok((app, emulator_manager))
}

#[actix_web::test]
async fn test_create_emulator() -> Result<()> {
    let (app, _) = setup_test_app().await?;

    let req = test::TestRequest::post()
        .uri("/emulators")
        .set_json(&CreateEmulatorRequest {
            name: "test_avd".to_string(),
        })
        .to_request();

    let resp: EmulatorResponse = test::call_and_read_body_json(&app, req).await;
    assert_eq!(resp.name, "test_avd");
    Ok(())
}

#[actix_web::test]
async fn test_get_emulator_status() -> Result<()> {
    let (app, manager) = setup_test_app().await?;

    // Create an emulator first
    let emulator = manager.create_emulator("test_avd".to_string()).await?;

    let req = test::TestRequest::get()
        .uri("/emulators/test_avd/status")
        .to_request();

    let resp: EmulatorResponse = test::call_and_read_body_json(&app, req).await;
    assert_eq!(resp.name, "test_avd");
    assert_eq!(resp.port, emulator.port());
    Ok(())
}

#[actix_web::test]
async fn test_nonexistent_emulator() -> Result<()> {
    let (app, _) = setup_test_app().await?;

    // Try to get status of nonexistent emulator
    let req = test::TestRequest::get()
        .uri("/emulators/nonexistent/status")
        .to_request();
    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 404);
    Ok(())
}
