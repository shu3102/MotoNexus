# MotoNexus: Technical Specification

**Version:** 1.0  
**Author:** Lead Architect

## 1. Introduction
This document provides the technical specification for the MotoNexus platform, based on the functional requirements outlined in the `MotoNexus_Full_Integrated_Project_Plan.md`. It details the recommended technology stack, database schema, core backend services, and identifies potential technical bottlenecks.

---

## 2. Recommended Technology Stack
The architecture is designed around a **Local-First, Offline-Sync** model, prioritizing functionality in low-connectivity environments.

| Component             | Technology                                                                                             | Rationale                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend (Mobile)** | **Angular 18 + Capacitor**                                                                             | As specified. Provides a single codebase for web, iOS, and Android. Angular's structure is ideal for a complex dashboard.            |
| **State Management**  | **NgRx or Angular Signals**                                                                            | For predictable state management, crucial for handling offline data and UI consistency.                                              |
| **Backend**           | **Java 21 + Spring Boot 3.x**                                                                          | Utilizes Project Loom's Virtual Threads for high-concurrency I/O, essential for handling thousands of simultaneous sync connections. |
| **Local Database**    | **Couchbase Lite**                                                                                     | A full-featured, embedded NoSQL database designed for mobile with robust, built-in synchronization capabilities.                  |
| **Central Database**  | **Couchbase Server**                                                                                   | The server-side counterpart to Couchbase Lite, enabling seamless data replication via the Sync Gateway.                             |
| **Sync Middleware**   | **Couchbase Sync Gateway**                                                                             | The bridge that securely manages data replication between the mobile app (Couchbase Lite) and the backend (Couchbase Server).        |
| **Authentication**    | **OAuth 2.0 / OIDC (Keycloak or Spring Security)**                                                       | Industry-standard for secure, token-based (JWT) authentication. Decouples auth logic from the core application services.           |
| **AI / ML Service**   | **Python (FastAPI) + TensorFlow Lite / PyTorch**                                                       | Python's ecosystem is unmatched for AI/ML. FastAPI provides a high-performance API. TFLite is for on-device OCR/analysis.         |
| **Messaging Queue**   | **Apache Kafka**                                                                                       | As specified. Ideal for asynchronous, durable event-driven communication, especially for SOS alerts and fan-out notifications.     |
| **Caching Layer**     | **Redis**                                                                                              | For caching "Rider DNA" profiles, session data, and supporting the real-time proximity engine with its geospatial features.        |
| **Map Services**      | **Mapbox SDK**                                                                                         | Provides excellent offline map capabilities, tile management, and APIs for navigation and rendering.                               |
| **Deployment**        | **Docker & Kubernetes (K8s)**                                                                          | Containerization for consistent environments and orchestration for scalability, resilience, and efficient resource management.       |

---

## 3. Database Schema (NoSQL - Couchbase Document Model)
The schema is designed as a set of JSON documents. Each document type will have a `type` field (e.g., `"type": "user"`) to distinguish between models within the same bucket.

### `user`
Stores public profile and private account information.
```json
{
  "userId": "user_abc123",
  "type": "user",
  "email": "rider@email.com",
  "username": "CycleSavvy",
  "authProviderId": "sub_from_oidc_provider",
  "profile": {
    "displayName": "Savvy Rider",
    "avatarUrl": "https://cdn.motoneus/avatars/...",
    "riderDNA": {
      "kilometersCruised": 45000,
      "citiesVisited": 35,
      "ridingStyle": "Leisure"
    }
  },
  "createdAt": "2023-10-27T10:00:00Z"
}
```

### `vehicle`
Represents a user's motorcycle in the Digital Garage.
```json
{
  "vehicleId": "veh_def456",
  "type": "vehicle",
  "ownerId": "user_abc123",
  "make": "Triumph",
  "model": "Street Triple 765 RS",
  "year": 2023,
  "registrationNumber": "MH12AB1234",
  "documents": [
    "doc_ins_789",
    "doc_rc_101"
  ]
}
```

### `document`
Stores metadata for an uploaded, encrypted document.
```json
{
  "docId": "doc_ins_789",
  "type": "document",
  "ownerId": "user_abc123",
  "docType": "INSURANCE",
  "encryptedFileUrl": "/secure/path/to/insurance.dat",
  "expiryDate": "2024-09-15T00:00:00Z",
  "extractedData": {
    "policyNumber": "POL987654321"
  },
  "lastChecked": "2023-10-27T11:00:00Z"
}
```

### `trip`
Contains all information related to a single ride, including route and expenses.
```json
{
  "tripId": "trip_ghi789",
  "type": "trip",
  "creatorId": "user_abc123",
  "name": "Weekend Ride to the Hills",
  "route": { "type": "LineString", "coordinates": [...] },
  "participants": ["user_abc123", "user_xyz789"],
  "expenses": [
    { "expenseId": "exp_1", "category": "FUEL", "amount": 550.75, "receiptUrl": "...", "timestamp": "..." }
  ],
  "channels": ["user_abc123", "user_xyz789"] // For Couchbase Sync Gateway access control
}
```

### `post`
A single entry in the MotoFeed.
```json
{
  "postId": "post_jkl101",
  "type": "post",
  "authorId": "user_abc123",
  "media": [{ "type": "image", "url": "..." }],
  "caption": "Awesome view from the top!",
  "tags": ["Triumph", "MountainPass"],
  "highFives": ["user_xyz789"],
  "commentsCount": 1,
  "createdAt": "2023-10-27T12:00:00Z"
}
```

---

## 4. Core Services (Microservice Architecture)

1.  **API Gateway (Spring Cloud Gateway):** The single, secured entry point for all mobile client requests. Handles routing, rate limiting, and cross-cutting concerns.
2.  **Auth Service (Keycloak):** Manages user identity, registration, login, and issues JWTs. It will be the central OIDC provider.
3.  **User & Profile Service:** Manages user data, profiles, and the AI-computed "Rider DNA".
4.  **Digital Garage Service:** Handles CRUD for vehicles and document metadata. Runs scheduled jobs to check for document expiry.
5.  **Trip & RideLog Service:** Manages trip creation, participant management, and expense logging. Contains the server-side logic for CRDT conflict resolution if needed beyond what Sync Gateway provides.
6.  **Feed Service:** Manages social posts, comments, and interactions ("High-Fives").
7.  **SOS Service:** Listens for `SOS_TRIGGERED` events from Kafka. Orchestrates broadcasting alerts to mechanics and handles the SMS gateway fallback logic.
8.  **AI Service (Python/FastAPI):** A dedicated, scalable service for:
    -   **OCR:** Processing document and receipt images.
    -   **Matching:** Running the "Trip Matchmaker" algorithm.
    -   **Moderation:** Screening community content.
    -   **Forecasting:** Integrating with weather/traffic APIs for route predictions.
9.  **Notification Service:** Consumes events from Kafka (e.g., `NEW_COMMENT`, `SOS_ACKNOWLEDGED`, `EXPIRY_REMINDER`) and sends push notifications to users via FCM/APNS.

---

## 5. Potential Technical Bottlenecks & Mitigation Strategies

1.  **AI Trip Matchmaker (FR13):**
    -   **Bottleneck:** A brute-force comparison of all riders is computationally expensive and will not scale.
    -   **Mitigation:** Use a specialized algorithm. Pre-calculate rider compatibility scores in the background. Use **Redis** or **Elasticsearch** to index "Rider DNA" vectors for fast nearest-neighbor searches.

2.  **Real-time Proximity Engine (FR17):**
    -   **Bottleneck:** Constant geospatial queries against the main database from thousands of users will create a high load.
    -   **Mitigation:** Offload this to a specialized in-memory store. Use **Redis's Geospatial indexes** (`GEOADD`, `GEORADIUS`) to store and query user locations and points of interest in real-time with very low latency.

3.  **Offline Map Tile Management (FR16):**
    -   **Bottleneck:** Downloading and storing large map files (potentially GBs) on the device can be slow, error-prone, and consume significant storage.
    -   **Mitigation:** Use the **Mapbox Offline SDK**, which is highly optimized for this. Implement background, resumable downloads. Store tiles in the `.mbtiles` format for efficient access.

4.  **Sync Gateway Concurrency:**
    -   **Bottleneck:** A high number of concurrent users syncing data (especially large photos/videos from the MotoFeed) can overwhelm a single Sync Gateway instance.
    -   **Mitigation:** Deploy Sync Gateway in a horizontally scalable cluster behind a load balancer. Implement channel-based data sharding to limit the data each user needs to process. The Spring Boot backend with Virtual Threads is already well-suited to handle the downstream load.

