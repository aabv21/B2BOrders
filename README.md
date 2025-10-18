# B2B Orders System

A complete B2B order management system built with Node.js, Express, MySQL, Docker, and AWS Lambda.

## 📋 Overview

This system consists of three main components:

1. **Customers API** (Port 3001) - Manages customer data with CRUD operations
2. **Orders API** (Port 3002) - Manages products and orders with stock control
3. **Lambda Orchestrator** - Serverless function to create and confirm orders

## 🏗️ Architecture

### Local Development
```
┌────────────────┐
│ Lambda         │
│ Orchestrator   │ ← HTTP Endpoint (Port 3000 local)
└────────┬───────┘
         │
         ├──────────────┬──────────────┐
         │              │              │
         ▼              ▼              ▼
┌────────────────┐ ┌────────────┐ ┌──────────┐
│ Customers API  │ │ Orders API │ │  MySQL   │
│   Port 3001    │ │ Port 3002  │ │ Port 3306│
└────────────────┘ └────────────┘ └──────────┘
```

### AWS Deployment
```
┌─────────────────────────────────────┐
│  AWS Lambda (us-east-1)             │
│  Orchestrator Function              │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  ngrok Tunnel                        │
│  https://xxx.ngrok-free.app          │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Proxy Server (localhost:4000)       │
└──────────┬───────────────────────────┘
           │
           ├──────────────┬─────────────┐
           │              │             │
           ▼              ▼             ▼
┌──────────────┐  ┌────────────┐  ┌──────────┐
│ Customers API│  │ Orders API │  │  MySQL   │
│  Port 3001   │  │ Port 3002  │  │Port 3306 │
└──────────────┘  └────────────┘  └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn
- AWS CLI (for Lambda deployment)
- ngrok (for Lambda to access local APIs)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd B2BOrders
```

2. **Environment variables are already configured**
```bash
# .env file is included with default values
# DB_PORT=3307 (Docker MySQL mapped port)
# JWT tokens are pre-generated without expiration
```

3. **Install dependencies**
```bash
npm run install:all
```

4. **Start services with Docker**
```bash
npm run docker:build
npm run docker:up
```

5. **Verify services are running**
```bash
# Customers API
curl http://localhost:3001/health

# Orders API
curl http://localhost:3002/health
```

## 🔐 Authentication

**All API endpoints require JWT Bearer token authentication.**

### JWT Token for Development

**Option 1: Use the permanent token from `.env`**

The `.env` file contains a permanent development token that never expires:

```bash
# Copy from .env file
DEV_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDY5MDMwMH0.LEaPvrm2K4SFXVMLFT7YPGgzPkfnMfajk1mnB3Z0tMQ
```

**Option 2: Generate a new token**

```bash
npm run generate:token
```

### Using the Token

Include the token in the `Authorization` header of all requests:

```bash
curl -X GET http://localhost:3001/customers/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDY5MDMwMH0.LEaPvrm2K4SFXVMLFT7YPGgzPkfnMfajk1mnB3Z0tMQ"
```

### Configuration

Set your secrets and tokens in the `.env` file:

```env
JWT_SECRET=b2b-orders-jwt-secret-key
SERVICE_SECRET=b2b-orders-service-internal-secret-key
SERVICE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoib3JkZXJzLWFwaSIsInB1cnBvc2UiOiJpbnRlcm5hbC1jb21tdW5pY2F0aW9uIiwiaWF0IjoxNzYwNzI3MDAxfQ.6UvvYEpgLhiKPftk1AYX0A3PCPSLy0FELqWRb6y1Fqg
```

⚠️ **Important:** Change these values in production!

📖 **For detailed authentication documentation, see [JWT_AUTHENTICATION.md](./JWT_AUTHENTICATION.md)**

## 📦 Database Setup

The database is automatically initialized with schema and seed data when Docker starts.

### Manual Migration (if needed)

```bash
# Run schema
npm run db:migrate

# Run seed data
npm run db:seed
```

### Database Schema

- **customers** - Customer information (id, name, email, phone)
- **products** - Product catalog (id, sku, name, price_cents, stock)
- **orders** - Orders (id, customer_id, status, total_cents)
- **order_items** - Order line items (id, order_id, product_id, qty, unit_price_cents, subtotal_cents)
- **idempotency_keys** - Idempotency tracking (key_value, target_type, target_id, status, response_body)

## 🔧 Development

### Run Services Individually

```bash
# Customers API
npm run dev:customers

# Orders API
npm run dev:orders

# Lambda Orchestrator (serverless-offline)
npm run dev:lambda
```

### Run Tests

All services have comprehensive test suites:

```bash
# Run all tests
npm test

# Individual service tests
cd customers-api && npm test  # 8 tests
cd orders-api && npm test     # 11 tests

# Test results:
# ✅ Customers API: 8/8 passing
# ✅ Orders API: 11/11 passing
```

**Test Coverage:**
- Health checks
- Authentication (401 without token)
- GET endpoints (with/without auth, 404 cases)
- POST endpoints (validation)
- Search functionality
- Idempotency validation

## 📚 API Documentation

### Customers API (Port 3001)

**OpenAPI Spec:** `customers-api/openapi.yaml`

#### Endpoints

🔒 All endpoints require JWT Bearer token authentication.

- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer by ID
- `GET /customers?search=&cursor=&limit=` - Search customers
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Soft delete customer
- `GET /internal/customers/:id` - Internal endpoint (requires service token)

#### Example: Create Customer

```bash
curl -X POST http://localhost:3001/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Solutions Inc",
    "email": "contact@techsolutions.com",
    "phone": "+1-555-1234"
  }'
```

### Orders API (Port 3002)

**OpenAPI Spec:** `orders-api/openapi.yaml`

#### Products Endpoints

🔒 All endpoints require JWT Bearer token authentication.

- `POST /products` - Create product
- `GET /products/:id` - Get product by ID
- `GET /products?search=&cursor=&limit=` - Search products
- `PATCH /products/:id` - Update product price/stock

#### Orders Endpoints

🔒 All endpoints require JWT Bearer token authentication.

- `POST /orders` - Create order (validates customer, checks stock, decreases stock)
- `GET /orders/:id` - Get order with items
- `GET /orders?status=&from=&to=&cursor=&limit=` - Search orders
- `POST /orders/:id/confirm` - Confirm order (requires X-Idempotency-Key header)
- `POST /orders/:id/cancel` - Cancel order (restores stock)

#### Example: Create Product

```bash
curl -X POST http://localhost:3002/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "WIDGET-001",
    "name": "Premium Widget",
    "price_cents": 2999,
    "stock": 100
  }'
```

#### Example: Create Order

```bash
curl -X POST http://localhost:3002/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 2, "qty": 3},
      {"product_id": 3, "qty": 1}
    ]
  }'
```

#### Example: Confirm Order (Idempotent)

```bash
curl -X POST http://localhost:3002/orders/1/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "X-Idempotency-Key: unique-key-123"
```

### Lambda Orchestrator

#### Local Testing (serverless-offline)

```bash
cd lambda-orchestrator
npm run dev
```

The Lambda will be available at: `http://localhost:3000/orchestrator/create-and-confirm-order`

#### Endpoint

`POST /orchestrator/create-and-confirm-order`

**Request Body:**
```json
{
  "customer_id": 1,
  "items": [
    {"product_id": 2, "qty": 3}
  ],
  "idempotency_key": "abc-123",
  "correlation_id": "req-789"
}
```

**Response (201):**
```json
{
  "success": true,
  "correlationId": "req-789",
  "data": {
    "customer": {
      "id": 1,
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "phone": "+1-555-0100"
    },
    "order": {
      "id": 10,
      "status": "CONFIRMED",
      "total_cents": 45900,
      "items": [...]
    }
  }
}
```

#### Example: Invoke Lambda Locally

```bash
curl -X POST http://localhost:3000/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 2, "qty": 3}],
    "idempotency_key": "test-key-'$(date +%s)'",
    "correlation_id": "req-123"
  }'
```

## ☁️ AWS Deployment

### Deploy Lambda to AWS

1. **Configure AWS credentials**
```bash
aws configure
```

2. **Update environment variables in `.env`**
```bash
CUSTOMERS_API_BASE_AWS=https://your-customers-api.execute-api.us-east-1.amazonaws.com
ORDERS_API_BASE_AWS=https://your-orders-api.execute-api.us-east-1.amazonaws.com
```

3. **Deploy Lambda**
```bash
cd lambda-orchestrator
npm run deploy
```

4. **Get Lambda endpoint URL**
```bash
serverless info
```

5. **Test deployed Lambda**
```bash
curl -X POST https://your-lambda-url.execute-api.us-east-1.amazonaws.com/dev/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 2, "qty": 3}],
    "idempotency_key": "prod-key-123"
  }'
```

### Deploy APIs to AWS (Optional)

You can deploy the Customers and Orders APIs using:
- AWS Elastic Beanstalk
- AWS ECS/Fargate
- AWS EC2 with Docker
- AWS App Runner

Update the Lambda environment variables with the deployed API URLs.

## 🧪 Testing

### Unit & Integration Tests

All services include comprehensive tests using Mocha + Chai.

```bash
# Run all tests
npm test

# Run with coverage (if configured)
npm run test:coverage
```

### Test Scenarios Covered

**Customers API:**
- Create customer with validation
- Duplicate email handling
- Search and pagination
- Update customer
- Soft delete

**Orders API:**
- Create order with stock validation
- Customer validation via internal API
- Order confirmation with idempotency
- Order cancellation with stock restoration
- Time-based cancellation rules (10-minute window for confirmed orders)

**Lambda Orchestrator:**
- End-to-end order creation and confirmation
- Customer validation
- Stock validation
- Idempotency handling
- Error handling and rollback

## 🔐 Security

- **JWT Authentication** - Customers API supports JWT tokens
- **Service Token** - Internal API endpoints require service token
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Input Validation** - Joi schema validation on all endpoints
- **SQL Injection Protection** - Parameterized queries with mysql2

## 🐳 Docker Commands

```bash
# Build images
npm run docker:build

# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Rebuild and restart
npm run docker:build && npm run docker:up
```

## 📊 Environment Variables

### Customers API
- `CUSTOMERS_API_PORT` - Port for Customers API (default: 3001)
- `JWT_SECRET` - Secret for JWT user token generation
- `SERVICE_SECRET` - Secret for JWT service token generation
- `SERVICE_TOKEN` - JWT token for service-to-service communication

### Orders API
- `ORDERS_API_PORT` - Port for Orders API (default: 3002)
- `CUSTOMERS_API_BASE` - Base URL for Customers API
- `SERVICE_TOKEN` - JWT token for calling internal Customers API endpoints

### Database
- `DB_HOST` - MySQL host (default: localhost)
- `DB_PORT` - MySQL port (default: 3306)
- `DB_USER` - MySQL user
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name (default: b2b_orders)

### Lambda
- `CUSTOMERS_API_BASE` - Customers API URL (local or AWS)
- `ORDERS_API_BASE` - Orders API URL (local or AWS)
- `SERVICE_TOKEN` - JWT token for calling internal Customers API endpoints

## 📝 Business Rules

1. **Order Creation:**
   - Validates customer exists
   - Checks product stock availability
   - Calculates totals automatically
   - Decreases stock atomically in transaction
   - Creates order in CREATED status

2. **Order Confirmation:**
   - Idempotent with X-Idempotency-Key header
   - Changes status from CREATED to CONFIRMED
   - Stores idempotency key for 24 hours

3. **Order Cancellation:**
   - CREATED orders can be canceled anytime
   - CONFIRMED orders can only be canceled within 10 minutes
   - Stock is restored automatically
   - Uses database transactions for atomicity

4. **Soft Delete:**
   - Customers are soft-deleted (deleted_at timestamp)
   - Soft-deleted customers are excluded from queries

## 🛠️ Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Validation:** Joi
- **Testing:** Mocha + Chai
- **Containerization:** Docker + Docker Compose
- **Serverless:** Serverless Framework
- **Cloud:** AWS Lambda (optional deployment)

## 📁 Project Structure

```
B2BOrders/
├── customers-api/          # Customers API service
│   ├── src/
│   │   ├── config/         # Database, JWT config
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth, validation
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Joi validation schemas
│   │   └── index.js        # Express app
│   ├── tests/              # Mocha tests
│   ├── openapi.yaml        # OpenAPI 3.0 spec
│   └── package.json
├── orders-api/             # Orders API service
│   ├── src/
│   │   ├── config/         # Database, axios config
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Validation
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Joi validation schemas
│   │   └── index.js        # Express app
│   ├── tests/              # Mocha tests
│   ├── openapi.yaml        # OpenAPI 3.0 spec
│   └── package.json
├── lambda-orchestrator/    # Lambda function
│   ├── handler.js          # Lambda handler
│   ├── serverless.yml      # Serverless config
│   ├── tests/              # Mocha tests
│   └── package.json
├── db/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Seed data
├── docker-compose.yml      # Docker services
├── .env.example            # Environment template
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

ISC

## 👤 Author

Andres Buelvas

---

## 🧪 Testing

### Run All Tests

```bash
# Customers API tests
cd customers-api
npm test

# Orders API tests
cd orders-api
npm test

# Lambda Orchestrator tests
cd lambda-orchestrator
npm test
```

### Test Coverage

**Customers API:**
- ✅ Unit Tests: `CustomerService` (5 methods)
- ✅ Integration Tests: All HTTP endpoints (GET, POST, PUT, DELETE)

**Orders API:**
- ✅ Unit Tests: `ProductService` (4 methods), `OrderService` (5 methods)
- ✅ Integration Tests: Product routes (5 endpoints), Order routes (5 endpoints)

**Lambda Orchestrator:**
- ✅ Integration Tests: End-to-end order orchestration flow

### Test Structure

```
customers-api/tests/
├── unit/
│   └── customer.service.test.js
└── integration/
    └── customer.routes.test.js

orders-api/tests/
├── unit/
│   ├── product.service.test.js
│   └── order.service.test.js
└── integration/
    ├── product.routes.test.js
    └── order.routes.test.js

lambda-orchestrator/tests/
└── handler.test.js
```

---

## 📊 Viewing Logs

### Real-time Logs

```bash
# Customers API logs
docker-compose logs -f customers-api

# Orders API logs
docker-compose logs -f orders-api

# MySQL logs
docker-compose logs -f mysql

# All services at once
docker-compose logs -f
```

### Lambda Orchestrator Logs

```bash
# Lambda runs locally (not in Docker)
cd lambda-orchestrator
npm run dev
# Logs will appear in the terminal
```

### Useful Log Commands

```bash
# View last 50 lines
docker-compose logs --tail=50 orders-api

# View logs from last hour
docker-compose logs --since 1h orders-api

# Filter logs by keyword
docker-compose logs -f orders-api | grep -i error

# View only HTTP requests
docker-compose logs -f orders-api | grep -i http
```

### Multiple Terminals (Recommended)

```bash
# Terminal 1: Customers API
docker-compose logs -f customers-api

# Terminal 2: Orders API
docker-compose logs -f orders-api

# Terminal 3: Lambda Orchestrator
cd lambda-orchestrator && npm run dev
```

---

## ☁️ AWS Lambda Deployment

### Current Deployment

**Endpoint:** `https://dflpbrmoel.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order`

**Status:** ✅ Deployed and Functional

### Prerequisites for Deployment

- AWS CLI configured with credentials
- Serverless Framework installed globally
- Local APIs running (Customers + Orders)
- ngrok account (free tier works)

### Step-by-Step Deployment

#### 1. Start Local Services

```bash
# Terminal 1: Start Docker services
docker-compose up

# Terminal 2: Start Proxy Server
node proxy-server.js
# Proxy will run on http://localhost:4000
```

#### 2. Expose Proxy with ngrok

```bash
# Terminal 3: Start ngrok
ngrok http 4000

# Copy the ngrok URL from output:
# Forwarding: https://1e4d208945fe.ngrok-free.app -> http://localhost:4000
```

#### 3. Update Lambda Configuration

```bash
cd lambda-orchestrator

# Edit serverless.yml and update these lines:
# CUSTOMERS_API_BASE: https://YOUR-NGROK-URL.ngrok-free.app
# ORDERS_API_BASE: https://YOUR-NGROK-URL.ngrok-free.app
```

#### 4. Deploy to AWS

```bash
npm run deploy

# Output will show:
# ✔ Service deployed to stack b2b-orders-orchestrator-dev
# endpoint: POST - https://xxx.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order
```

#### 5. Test the Deployment

```bash
curl -X POST https://dflpbrmoel.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 2}],
    "idempotency_key": "unique-key-'$(date +%s)'",
    "correlation_id": "req-test"
  }'

# Expected response:
# {
#   "success": true,
#   "correlationId": "req-test",
#   "data": {
#     "customer": { "id": 1, "name": "Acme Corporation", ... },
#     "order": { "id": 23, "status": "CONFIRMED", ... }
#   }
# }
```

### Lambda Management Commands

```bash
cd lambda-orchestrator

# View logs
npm run logs

# Remove deployment
npm run remove

# Local testing with serverless-offline
npm run dev:serverless
```

### Important Notes

- **ngrok URL changes** every time you restart ngrok (free tier)
- After restarting ngrok, update `serverless.yml` and redeploy
- Tokens are configured without expiration for development
- See [lambda-orchestrator/README.md](lambda-orchestrator/README.md) and [PROXY-README.md](PROXY-README.md) for more details

---

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Check if MySQL is running
docker ps | grep mysql

# Check MySQL logs
docker logs b2b-mysql

# Restart MySQL
docker-compose restart mysql
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Lambda Not Starting Locally

```bash
# Make sure APIs are running first
curl http://localhost:3001/health
curl http://localhost:3002/health

# Check serverless-offline logs
cd lambda-orchestrator
npm run dev
```

## 📞 Support

For issues or questions, please open an issue in the GitHub repository.