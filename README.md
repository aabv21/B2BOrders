# B2B Orders System

A complete B2B order management system with microservices architecture, built with Node.js, Express, MySQL, Docker, and AWS Lambda.

## 📋 System Components

- **Customers API** (Port 3001) - Customer management with CRUD operations
- **Orders API** (Port 3002) - Products and orders with stock control and idempotency
- **Lambda Orchestrator** - AWS Lambda function for atomic create-and-confirm order workflow

## 🚀 Quick Start - Local Development

### 1. Start Docker Services

```bash
# Start MySQL, Customers API, and Orders API
docker-compose up -d

# Verify services are running
curl http://localhost:3001/health  # Customers API
curl http://localhost:3002/health  # Orders API
```

### 2. Test the APIs

```bash
# Get authentication token (already configured in .env)
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDc2MDc0Mn0.8K7nFk5LJKyDFNUlc-bdZPkKMVNH7CtfQ1ttchP0eaM"

# Create an order
curl -X POST http://localhost:3002/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 2}]
  }'

# Confirm the order (replace ORDER_ID with the id from previous response)
curl -X POST http://localhost:3002/orders/ORDER_ID/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Idempotency-Key: unique-key-$(date +%s)" \
  -d '{}'
```

### 3. Run Tests

```bash
# Customers API tests (8/8 passing)
cd customers-api && npm test

# Orders API tests (11/11 passing)
cd orders-api && npm test
```

## ☁️ AWS Lambda Deployment

### Current Deployment

**Endpoint:** `https://dflpbrmoel.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order`

### Test the Lambda

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

### Deploy Your Own Lambda

1. **Start local services and proxy**
```bash
# Terminal 1: Start Docker
docker-compose up

# Terminal 2: Start proxy server
node proxy-server.js

# Terminal 3: Expose with ngrok
ngrok http 4000
```

2. **Update Lambda configuration**
```bash
cd lambda-orchestrator

# Edit serverless.yml with your ngrok URL:
# CUSTOMERS_API_BASE: https://YOUR-NGROK-URL.ngrok-free.app
# ORDERS_API_BASE: https://YOUR-NGROK-URL.ngrok-free.app
```

3. **Deploy to AWS**
```bash
npm run deploy
```

See [lambda-orchestrator/README.md](lambda-orchestrator/README.md) for detailed deployment instructions.

## 📚 API Documentation

### Customers API

- **Health:** `GET /health`
- **Create Customer:** `POST /customers`
- **Get Customer:** `GET /customers/:id`
- **Search Customers:** `GET /customers?search=&limit=`
- **Update Customer:** `PUT /customers/:id`
- **Delete Customer:** `DELETE /customers/:id`

**OpenAPI Spec:** [customers-api/openapi.yaml](customers-api/openapi.yaml)

### Orders API

**Products:**
- `POST /products` - Create product
- `GET /products/:id` - Get product
- `GET /products?search=&limit=` - Search products
- `PATCH /products/:id` - Update price/stock

**Orders:**
- `POST /orders` - Create order (validates stock, calculates total)
- `GET /orders/:id` - Get order details
- `POST /orders/:id/confirm` - Confirm order (requires X-Idempotency-Key)
- `POST /orders/:id/cancel` - Cancel order (restores stock based on rules)

**OpenAPI Spec:** [orders-api/openapi.yaml](orders-api/openapi.yaml)

### Lambda Orchestrator

- `POST /orchestrator/create-and-confirm-order` - Atomic workflow: validate customer → create order → confirm order

## 🗄️ Database

MySQL 8.0 with automatic initialization:

- **Schema:** [db/schema.sql](db/schema.sql)
- **Seed Data:** [db/seed.sql](db/seed.sql)
- **Port:** 3307 (mapped from container's 3306)

```bash
# Connect to database
docker exec -it b2b-mysql mysql -uroot -prootpassword b2b_orders
```

## 🔐 Authentication

All endpoints require JWT Bearer token authentication (except `/health`).

**Development Token (no expiration):**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDc2MDc0Mn0.8K7nFk5LJKyDFNUlc-bdZPkKMVNH7CtfQ1ttchP0eaM"
```

Generate new tokens:
```bash
node generate-token.js
```

## 🛠️ Development Commands

```bash
# Install all dependencies
npm run install:all

# Build Docker images
npm run docker:build

# Start Docker services
npm run docker:up

# Stop Docker services
npm run docker:down

# View logs
docker-compose logs -f

# Run individual services
cd customers-api && npm run dev
cd orders-api && npm run dev
cd lambda-orchestrator && npm run dev
```

## 📁 Project Structure

```
B2BOrders/
├── customers-api/          # Customer management microservice
├── orders-api/             # Orders and products microservice
├── lambda-orchestrator/    # AWS Lambda orchestrator
├── db/                     # Database schema and seeds
├── docker-compose.yml      # Docker services configuration
├── proxy-server.js         # Proxy for Lambda-to-local communication
└── generate-token.js       # JWT token generator
```

## 🧪 Testing

All services have comprehensive test suites:

- **Customers API:** 8/8 tests passing
- **Orders API:** 11/11 tests passing

Tests cover:
- Health checks
- Authentication (401 without token)
- CRUD operations
- Validation (400 for invalid data)
- Not found (404 for missing resources)
- Idempotency validation

## 📖 Additional Documentation

- [Customers API README](customers-api/README.md)
- [Orders API README](orders-api/README.md)
- [Lambda Orchestrator README](lambda-orchestrator/README.md)

## 🔍 Key Features

- ✅ Microservices architecture with Docker
- ✅ JWT authentication
- ✅ Stock management with transactions
- ✅ Idempotent order confirmation
- ✅ AWS Lambda deployment
- ✅ OpenAPI 3.0 documentation
- ✅ Comprehensive test coverage
- ✅ Cursor-based pagination
- ✅ Rate limiting
- ✅ Soft delete for customers
- ✅ Time-based order cancellation rules

## 📝 License

ISC
