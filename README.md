# B2B Orders System

A complete B2B order management system with microservices architecture — built with Node.js, Express, MySQL, Docker, and AWS Lambda. Features idempotent order confirmation, stock management with transactions, and an atomic Lambda orchestrator.

---

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=flat-square&logo=awslambda&logoColor=white)
![AWS API Gateway](https://img.shields.io/badge/API_Gateway-FF4F00?style=flat-square&logo=amazon-aws&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Client                           │
└───────┬─────────────────────────┬───────────────────┘
        │ REST                    │ REST
┌───────▼───────┐        ┌────────▼────────────────────┐
│ Customers API │        │      Orders API             │
│  (Port 3001)  │        │     (Port 3002)             │
│               │        │  Products · Orders · Stock  │
│    MySQL      │        │         MySQL               │
└───────────────┘        └────────────────────────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │    Lambda Orchestrator  │  ← AWS Lambda
        │  create-and-confirm-    │
        │      order (atomic)     │
        └─────────────────────────┘
```

---

## System Components

| Service | Port | Responsibility |
|---|---|---|
| **Customers API** | 3001 | Customer management · CRUD · soft delete · pagination |
| **Orders API** | 3002 | Products · orders · stock control · idempotent confirmation |
| **Lambda Orchestrator** | AWS | Atomic create-and-confirm order workflow |

---

## Key Features

- ✅ **Microservices** — independent services with their own MySQL databases
- ✅ **Idempotent order confirmation** — `X-Idempotency-Key` header prevents duplicate processing
- ✅ **Stock management** — transactional stock control with validation on order creation
- ✅ **AWS Lambda orchestrator** — atomic workflow: validate customer → create order → confirm order
- ✅ **JWT authentication** — required on all endpoints except `/health`
- ✅ **OpenAPI 3.0 docs** — full spec for both APIs
- ✅ **Comprehensive tests** — 8/8 Customers · 11/11 Orders all passing
- ✅ **Cursor-based pagination** — efficient large dataset traversal
- ✅ **Rate limiting** — per-IP request throttling
- ✅ **Soft delete** — customers are deactivated, not permanently removed
- ✅ **Time-based cancellation rules** — order cancellation logic based on status and timing

---

## Quick Start

**Prerequisites:** Docker & Docker Compose

```bash
# Clone the repository
git clone https://github.com/aabv21/B2BOrders.git
cd B2BOrders

# Install all dependencies
npm run install:all

# Start all services
docker-compose up -d

# Verify services are running
curl http://localhost:3001/health  # Customers API
curl http://localhost:3002/health  # Orders API
```

---

## Testing the APIs

```bash
# Set auth token
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDc2MDc0Mn0.8K7nFk5LJKyDFNUlc-bdZPkKMVNH7CtfQ1ttchP0eaM"

# Create an order
curl -X POST http://localhost:3002/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1, "items": [{"product_id": 1, "qty": 2}]}'

# Confirm the order (idempotent)
curl -X POST http://localhost:3002/orders/ORDER_ID/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Idempotency-Key: unique-key-$(date +%s)" \
  -d '{}'
```

Generate a new JWT token:
```bash
node generate-token.js
```

---

## AWS Lambda

**Live endpoint:**
```
POST https://dflpbrmoel.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order
```

```bash
curl -X POST https://dflpbrmoel.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 2}],
    "idempotency_key": "unique-key-'$(date +%s)'",
    "correlation_id": "test-request"
  }'
```

**Deploy your own Lambda:**

```bash
# Terminal 1: Start Docker
docker-compose up

# Terminal 2: Start proxy
node proxy-server.js

# Terminal 3: Expose with ngrok
ngrok http 4000

# Update lambda-orchestrator/serverless.yml with your ngrok URL, then:
cd lambda-orchestrator && npm run deploy
```

---

## API Reference

### Customers API `Port 3001`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/customers` | Create customer |
| `GET` | `/customers/:id` | Get customer by ID |
| `GET` | `/customers?search=&limit=` | Search customers |
| `PUT` | `/customers/:id` | Update customer |
| `DELETE` | `/customers/:id` | Soft delete customer |

📄 [OpenAPI Spec](customers-api/openapi.yaml)

### Orders API `Port 3002`

**Products**

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/products` | Create product |
| `GET` | `/products/:id` | Get product |
| `GET` | `/products?search=&limit=` | Search products |
| `PATCH` | `/products/:id` | Update price / stock |

**Orders**

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Create order (validates stock, calculates total) |
| `GET` | `/orders/:id` | Get order details |
| `POST` | `/orders/:id/confirm` | Confirm order (requires `X-Idempotency-Key`) |
| `POST` | `/orders/:id/cancel` | Cancel order (restores stock per business rules) |

📄 [OpenAPI Spec](orders-api/openapi.yaml)

### Lambda Orchestrator

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orchestrator/create-and-confirm-order` | Atomic: validate customer → create → confirm |

---

## Database

MySQL 8.0 with automatic initialization via Docker:

```bash
# Connect to database
docker exec -it b2b-mysql mysql -uroot -prootpassword b2b_orders
```

- **Schema:** [db/schema.sql](db/schema.sql)
- **Seed Data:** [db/seed.sql](db/seed.sql)
- **Port:** 3307 (mapped from container's 3306)

---

## Running Tests

```bash
# Customers API — 8/8 passing
cd customers-api && npm test

# Orders API — 11/11 passing
cd orders-api && npm test
```

Tests cover: health checks · authentication · CRUD · validation · 404 handling · idempotency

---

## Project Structure

```
B2BOrders/
├── customers-api/          # Customer management microservice
├── orders-api/             # Orders and products microservice
├── lambda-orchestrator/    # AWS Lambda atomic orchestrator
├── db/                     # MySQL schema and seed data
├── docker-compose.yml      # Docker services configuration
├── proxy-server.js         # Proxy for Lambda-to-local comms
└── generate-token.js       # JWT token generator
```

---

## Development Commands

```bash
npm run install:all     # Install all dependencies
npm run docker:build    # Build Docker images
npm run docker:up       # Start Docker services
npm run docker:down     # Stop Docker services
docker-compose logs -f  # View logs

# Run services individually
cd customers-api && npm run dev
cd orders-api && npm run dev
cd lambda-orchestrator && npm run dev
```

---

## Additional Documentation

- [Customers API README](customers-api/README.md)
- [Orders API README](orders-api/README.md)
- [Lambda Orchestrator README](lambda-orchestrator/README.md)

---

## Related Projects

- [cqrs-blog-app](https://github.com/aabv21/cqrs-blog-app) — CQRS pattern with microservices
- [photo-post](https://github.com/aabv21/photo-post) — Microservices with Kafka & Redis
- [microservices-js-node](https://github.com/aabv21/microservices-js-node) — Node.js microservices with Kubernetes

---

<div align="center">
  <sub>Built by <a href="https://github.com/aabv21">Andrés Buelvas</a> · Full Stack Engineer</sub>
</div>
