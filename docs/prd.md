---
title: Project Roadmap
---
### Project Overview
**App Name:** TikPilot
**Goal:** Build an application where an AI agent mimics human interaction (e.g., scrolling, liking, commenting, posting) on TikTok-like platforms, controlling multiple accounts via emulators, with a user-friendly frontend to manage setups.
**Key Features:**
- AI-driven interaction mimicking human behavior.
- Multi-account management via Android emulators.
- Browser-based control for AI agents.
- High-performance backend using Rust.
- Containerized deployment for scalability and consistency.
- Frontend interface for configuration and monitoring.

---

### Plan Breakdown

#### 1. Architecture Design
- **Frontend:** Web interface built with Remix (React framework), styled with TailwindCSS and shadcn components for a sleek, responsive UI.
- **Backend:** Rust-based server to handle emulator orchestration, AI logic, and browser automation.
- **Emulators:** Android emulators (e.g., LDPlayer or Genymotion) running TikTok-like apps, controlled via ADB (Android Debug Bridge) and browser automation.
- **AI Agent:** A behavior simulation module to mimic human actions (e.g., random delays, natural scrolling patterns).
- **Deployment:** Docker containers for backend, frontend, and emulator instances.

#### 2. Tech Stack
- **Backend:** Rust (Actix Web for the server, Tokio for async tasks)
    - Consider using Tonic for gRPC communication if you need high performance and strong typing between services.
    - For complex state management, explore using a state management library like `Redux` or `Recoil` in Rust with a WASM frontend.
- **Frontend:** Remix (React), TailwindCSS, shadcn/ui
    - Consider using Zustand for simpler state management if Redux is overkill.
    - Explore using React Query or SWR for data fetching and caching.
- **Containerization:** Docker, Docker Compose
    - Consider using Kubernetes for orchestrating the containers in a production environment.
    - Use multi-stage Docker builds to reduce the image size.
- **Emulators:** LDPlayer/Genymotion (lightweight, supports multiple instances)
    - Consider using Android Virtual Device (AVD) for more control over the emulator environment.
- **Browser Automation:** Playwright (Node.js) instead of Puppeteer or thirtyfour.
    - Consider using TypeScript for the Playwright microservice for better type safety and maintainability.
- **Database:** SQLite (lightweight, local storage for account configs) or PostgreSQL (if scaling to multi-user)
    - Consider using Redis for caching frequently accessed data.
- **Communication:** REST API between frontend and backend, WebSocket for real-time updates.
    - Consider using gRPC for communication between backend services for better performance and type safety.

#### 3. Development Phases

##### Phase 1: Setup and Core Infrastructure
- **Objective:** Establish the foundation for the app.
- **Tasks:**
  - Set up a Rust project with Actix Web for the backend API.
  - Create a basic Remix app with TailwindCSS and shadcn components.
  - Configure Docker for containerizing the backend and frontend.
  - Write a simple "Hello World" API endpoint in Rust and connect it to the Remix frontend.
- **Deliverables:** A working skeleton with frontend-backend communication.

##### Phase 2: Emulator Integration
- **Objective:** Enable the backend to spawn and control multiple Android emulators.
- **Tasks:**
  - Install and configure an emulator (e.g., LDPlayer) on the host system.
  - Use Rust to interface with ADB (via `std::process::Command` or a crate like `adb_client`).
  - Write a Rust module to:
    - Launch multiple emulator instances with unique ports.
    - Install the target TikTok-like app on each emulator.
  - Add API endpoints to start/stop emulators and list active instances.
- **Deliverables:** Backend can spawn and manage multiple emulator instances.

##### Updated Plan: Integrate Browser Automation with Playwright

###### Revised Section: Phase 3 - AI Agent and Browser Automation
- **Objective:** Implement human-like interaction logic using Playwright for browser-based control across multiple emulator instances.
- **Tasks:**
  - **Replace Puppeteer/thirtyfour with Playwright:**
    - Use Playwright's Node.js implementation (it's actively maintained, supports multiple browsers, and handles mobile emulation well).
    - Create a lightweight Node.js microservice to run Playwright, exposing an API for the Rust backend to call (e.g., via HTTP or gRPC).
  - **Control Emulator Screens:**
    - Use ADB to launch TikTok/Instagram apps on emulators and get their WebView contexts (many mobile apps use WebView for rendering).
    - Alternatively, use Playwright's device emulation to run TikTok/Instagram in a browser-like environment, mimicking mobile behavior (e.g., setting viewport to match Android devices).
    - For native app control, combine ADB inputs (e.g., tap, swipe) with Playwright for WebView interactions.
  - **Link Multiple Accounts to Emulators:**
    - Store account credentials and emulator mappings in a SQLite database (e.g., `emulator_id`, `account_username`, `account_password`).
    - Write a Rust module to assign accounts to emulator instances dynamically (e.g., load from DB, inject credentials via ADB or Playwright).
  - **Expose API Endpoints:**
    - Extend the Rust backend to include endpoints like:
      - `POST /scroll/{emulator_id}`: Trigger scrolling behavior.
      - `POST /like/{emulator_id}`: Like the current post.
      - `POST /comment/{emulator_id}`: Post a randomized comment.
    - Proxy these requests to the Playwright microservice for execution.
  - **AI Behavior Logic:**
    - Implement in Rust to keep performance high:
      - Randomize interaction timing (e.g., scroll every 2-7 seconds).
      - Vary actions (e.g., 15% chance to like, 5% chance to comment).
    - Send commands to Playwright for execution.
- **Deliverables:**
  - Playwright microservice controlling TikTok/Instagram interactions.
  - Rust backend orchestrating multiple emulator instances with account mappings.
  - API endpoints triggering realistic AI-driven actions.

###### Tech Stack Update
- **Browser Automation:** Playwright (Node.js) instead of Puppeteer or thirtyfour.
- **Communication:** REST API between Rust backend and Playwright microservice; WebSocket for real-time emulator status updates.
- **Emulator Control:** ADB for native app launching, Playwright for WebView/browser interactions.

##### Phase 4: Frontend Development
- **Objective:** Build an intuitive UI to manage emulators and AI actions.
- **Tasks:**
  - Design pages with Remix:
    - Dashboard: Overview of active emulators and accounts.
    - Emulator Setup: Form to configure emulator instances (e.g., number of instances, app version).
    - Action Control: Buttons/sliders to adjust AI behavior (e.g., scroll speed, like frequency).
  - Style with TailwindCSS and shadcn components (e.g., modals, buttons, tables).
  - Fetch data from backend API and display real-time updates via WebSocket.
- **Deliverables:** Fully functional frontend to configure and monitor the app.

##### Phase 5: Containerization and Deployment
- **Objective:** Package the app for easy deployment and scalability.
- **Tasks:**
  - Create Dockerfiles:
    - Backend: Rust app with dependencies.
    - Frontend: Remix app with Node.js.
    - Emulator: Base image with emulator pre-installed (e.g., LDPlayer in a Linux container).
  - Write a `docker-compose.yml` file to orchestrate:
    - Backend service.
    - Frontend service.
    - Emulator service (dynamic scaling for multiple instances).
  - Test deployment locally with Docker Compose.
  - Optimize Rust binary size with `strip` and `--release` flags.
- **Deliverables:** App runs seamlessly in Docker containers.

##### Phase 6: Testing and Refinement
- **Objective:** Ensure reliability and human-like behavior.
- **Tasks:**
  - Test edge cases (e.g., emulator crashes, network issues).
  - Fine-tune AI behavior to avoid detection by TikTok-like platforms (e.g., randomized fingerprints, IP rotation if needed).
  - Add logging and error handling in Rust.
  - Conduct user testing on the frontend for usability.
- **Deliverables:** Stable, polished app ready for use.

#### 4. Additional Details
- **Security:**
  - Encrypt account credentials stored in the database.
  - Use environment variables for sensitive configs (e.g., API keys).
- **Scalability:** Supporting Many Instances of TikTok/Instagram
  Yes, this spec can handle many instances of TikTok or Instagram across multiple emulators. Here's how:

  1. **Emulator Scalability:**
     - Each emulator instance runs as a separate Docker container (e.g., `scale: 10` in Docker Compose spawns 10 instances).
     - Assign unique ports (e.g., 5555, 5556, etc.) and device IDs via ADB to avoid conflicts.
     - Rust backend tracks active emulators in the database or memory (e.g., HashMap of `emulator_id` to `status`).

  2. **Account Management:**
     - Store hundreds of account credentials in SQLite/PostgreSQL.
     - Dynamically assign accounts to emulators via API or config files (e.g., `emulator_1: @user1, emulator_2: @user2`).
     - Use Playwright to log in to TikTok/Instagram on each emulator instance.

  3. **Performance:**
     - Rust's efficiency ensures the backend can orchestrate dozens or hundreds of emulators without bottlenecks.
     - Playwright microservice can be scaled horizontally (e.g., multiple instances behind a load balancer) if needed.
     - Limit emulator resource usage (e.g., 1 CPU core, 512MB RAM per instance) to run many on a single host.

  4. **Automation Flexibility:**
     - Playwright supports mobile emulation, so you can run TikTok/Instagram in a browser context if WebView access is blocked.
     - Combine with ADB for native app control (e.g., swipe gestures, button taps) to mimic human behavior fully.

  5. **Resource Considerations:**
     - A powerful host (e.g., 16-core CPU, 64GB RAM) could run 20-50 emulator instances comfortably.
     - For hundreds of instances, deploy across multiple servers with Kubernetes or a cloud provider (e.g., AWS ECS).
- **Performance:**
  - Rust's memory safety and speed will handle emulator orchestration efficiently.
  - Optimize emulator resource usage (e.g., limit CPU/memory per instance).
- **Legal/Ethical Considerations:**
  - Ensure compliance with TikTok's terms of service (this may require a custom app for testing instead of TikTok itself).
  - Avoid spamming or malicious behavior.

#### 5. Timeline (Estimated)
- Phase 1: 1-2 weeks
- Phase 2: 2-3 weeks
- Phase 3: 3-4 weeks (Note: This phase is now updated with Playwright integration)
- Phase 4: 2-3 weeks
- Phase 5: 1-2 weeks
- Phase 6: 1-2 weeks
- **Total:** ~10-16 weeks (depending on team size and expertise)

#### 6. Sample Code Snippets
- **Rust Backend (Calling Playwright Microservice):**
  ```rust
  use actix_web::{web, App, HttpServer, Responder};
  use reqwest::Client;

  async fn scroll(emulator_id: web::Path<String>) -> impl Responder {
      let client = Client::new();
      let res = client
          .post(&format!("http://playwright:3001/scroll/{}", emulator_id))
          .send()
          .await
          .unwrap();
      res.text().await.unwrap()
  }

  #[actix_web::main]
  async fn main() -> std::io::Result<()> {
      HttpServer::new(|| {
          App::new()
              .route("/scroll/{id}", web::post().to(scroll))
      })
      .bind("127.0.0.1:8080")?
      .run()
      .await
  }
  ```

- **Playwright Microservice (Node.js):**
  ```javascript
  const { chromium } = require('playwright');
  const express = require('express');
  const app = express();

  app.post('/scroll/:emulatorId', async (req, res) => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 360, height: 640 } });
    const page = await context.newPage();
    await page.goto(`http://emulator-${req.params.emulatorId}:5555/webview`); // Example WebView URL
    await page.evaluate(() => window.scrollBy(0, 500)); // Simulate scroll
    await browser.close();
    res.send('Scrolled');
  });

  app.listen(3001, () => console.log('Playwright service on port 3001'));
  ```

- **Docker Compose (Updated):**
  ```yaml
  version: '3'
  services:
    backend:
      build: ./backend
      ports:
        - "8080:8080"
    frontend:
      build: ./frontend
      ports:
        - "3000:3000"
    playwright:
      build: ./playwright
      ports:
        - "3001:3001"
    emulator:
      build: ./emulator
      scale: 10 # Supports many instances
      ports:
        - "5555-5565:5555" # Dynamic port mapping for emulators
  ```

#### Updated Answers to Your Questions
1. **Why Playwright?**
   - More up-to-date than Puppeteer (supports modern browser features, better mobile emulation).
   - Cross-browser support (Chromium, Firefox, WebKit) ensures flexibility.
   - Built-in tools for handling dynamic content (e.g., infinite scrolling on TikTok).

2. **Can it handle many instances?**
   - Yes, the containerized architecture and Rust's performance make it feasible to run dozens or hundreds of TikTok/Instagram instances, limited only by hardware and network capacity.

---

#### 7. Tech Stack Analysis and Recommendations (2025 Update)

##### Backend (Rust + Actix Web)
✅ **Current Choice Validated:**
- Rust remains an excellent choice for performance-critical systems in 2025
- Actix Web is still one of the fastest web frameworks
- Tokio continues to be the de-facto async runtime

🔄 **Recommended Updates:**
- Consider axum (from Tokio team) as an alternative to Actix Web
  - Better ergonomics and growing ecosystem
  - Native Tower integration for middleware
- Add OpenTelemetry for observability
- Use sea-orm instead of raw SQLx for better database abstraction

##### Frontend (Remix + React)
✅ **Current Choice Validated:**
- Remix provides excellent server-side capabilities
- TailwindCSS and shadcn/ui remain solid choices

🔄 **Recommended Updates:**
- Replace Zustand with Jotai for atomic state management
- Add TanStack Query (formerly React Query) v5+ for data fetching
- Consider using React Server Components for better performance
- Add Playwright Test for E2E testing

##### Browser Automation (Playwright)
✅ **Current Choice Validated:**
- Playwright remains the most maintained and feature-rich option
- Better mobile emulation support than alternatives

🔄 **Recommended Updates:**
- Use Playwright Test instead of separate test runner
- Implement CDP (Chrome DevTools Protocol) directly for better control
- Add browser fingerprint randomization
- Consider using proxy-chain for IP rotation

##### Database (SQLite/PostgreSQL)
✅ **Current Choice Validated:**
- SQLite for development/single instance
- PostgreSQL for production/multi-instance

🔄 **Recommended Updates:**
- Add TimescaleDB extension for time-series data
- Implement connection pooling with PgBouncer
- Use pgvector for AI feature vectors if needed
- Consider CockroachDB for global distribution

##### Infrastructure
✅ **Current Choice Validated:**
- Docker + Docker Compose remains solid for development
- Kubernetes for production scaling

🔄 **Recommended Updates:**
- Use Podman instead of Docker for better security
- Implement GitOps with ArgoCD or Flux
- Add Terraform for infrastructure as code
- Consider using Cilium for network security

##### Security Enhancements
- Implement mTLS between services
- Add rate limiting with Redis
- Use Vault for secrets management
- Implement WAF rules for API protection

##### Performance Optimizations
- Use WASM for compute-intensive tasks
- Implement circuit breakers for external services
- Add Redis caching layer
- Use connection pooling for all external services

##### Code Examples for New Recommendations:

```rust
// Backend: Using axum instead of actix-web
use axum::{
    routing::{get, post},
    Router,
};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(root))
        .route("/scroll/:id", post(scroll))
        .layer(tower_http::trace::TraceLayer::new_for_http());

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
```

```typescript
// Frontend: Modern React patterns with Jotai
import { atom, useAtom } from 'jotai';
import { atomWithQuery } from 'jotai/query';

const emulatorAtom = atom<string[]>([]);
const emulatorQueryAtom = atomWithQuery((get) => ({
  queryKey: ['emulators'],
  queryFn: async () => {
    const response = await fetch('/api/emulators');
    return response.json();
  },
}));

function EmulatorList() {
  const [emulators] = useAtom(emulatorQueryAtom);
  return (
    <div>
      {emulators.map(emulator => (
        <EmulatorCard key={emulator.id} {...emulator} />
      ))}
    </div>
  );
}
```

```yaml
# Modern Docker Compose with Podman
version: '3.9'
services:
  backend:
    image: localhost/tikpilot-backend:latest
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

These updates maintain the project's core architecture while incorporating modern best practices and performance improvements. The changes focus on security, scalability, and maintainability without compromising the original design goals.

---
