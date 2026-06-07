# MotoNexus

MotoNexus is an end-to-end platform tailored for motorcycle enthusiasts, offering comprehensive ride analytics, real-time fleet tracking, and a dynamic community feed (MotoFeed).

## Demo

![MotoNexus Demo](./motoNexus.gif)

## Architecture

MotoNexus is built using a modern microservices architecture with the following core components:

### Backend Services (Spring Boot & Java)
- **API Gateway**: Entry point for all client requests.
- **User Service**: Manages user profiles and authentication.
- **Digital Garage Service**: Keeps track of vehicles and maintenance logs.
- **RideLog Service**: Captures real-time GPS telemetry and ride data.
- **Fleet Tracking Service**: Provides real-time tracking using WebSockets.
- **Community Service (MotoFeed)**: Handles social interactions, user-generated content, and feeds.
- **AI Service (Python/FastAPI)**: Provides actionable ride data analytics and insights.

### Frontend
- **MotoNexus Mobile**: Mobile frontend application built to provide a seamless cross-platform experience for riders.

### Infrastructure & Data Services
- **Couchbase & Sync Gateway**: Used for offline-first capabilities and data synchronization.
- **PostgreSQL**: Relational database for structured data (e.g., Keycloak data).
- **Keycloak**: Handles robust authentication and security.
- **Kafka & Zookeeper**: Event streaming platform for asynchronous communication between microservices, specifically handling high-throughput telemetry data processing.
- **Redis**: Caching layer for performance optimization.

## Getting Started

1. **Start Infrastructure**: Ensure you have Docker installed and run the following command to spin up the required databases, message queues, and caching layers:
   ```bash
   docker-compose up -d
   ```
2. **Start Backend Services**: Navigate to the `motoneus-backend` directory and start the Spring Boot microservices.
3. **Start Frontend Application**: Navigate to the `motoneus-frontend/motoneus-mobile` directory, install dependencies, and start the development server.
