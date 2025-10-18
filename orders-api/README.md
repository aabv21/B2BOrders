# Orders API

REST API for managing B2B products and orders with stock control, validation, and idempotency.

## 📋 Features

- ✅ Product management (CRUD operations)
- ✅ Order creation with stock validation
- ✅ Customer validation via Customers API
- ✅ Automatic total calculation
- ✅ Stock management with database transactions
- ✅ Idempotent order confirmation
- ✅ Order cancellation with stock restoration
- ✅ Time-based cancellation rules
- ✅ Input validation with Joi
- ✅ Rate limiting
- ✅ OpenAPI 3.0 documentation
- ✅ Comprehensive test suite (11/11 passing)

## 🚀 Quick Start

### Run with Docker Compose

```bash
# From project root
docker-compose up orders-api

# Verify it's running
curl http://localhost:3002/health
```

### Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:3002
```

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

No authentication required.

### Products

All endpoints require JWT Bearer token authentication.

#### Create Product

```bash
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "LAPTOP-002",
  "name": "Gaming Laptop 17\"",
  "price_cents": 199900,
  "stock": 15
}
```

#### Get Product by ID

```bash
GET /products/:id
Authorization: Bearer <token>
```

#### Search Products

```bash
GET /products?search=laptop&cursor=0&limit=10
Authorization: Bearer <token>
```

#### Update Product Price/Stock

```bash
PATCH /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price_cents": 189900,
  "stock": 20
}
```

### Orders

#### Create Order

```bash
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "qty": 2
    },
    {
      "product_id": 2,
      "qty": 1
    }
  ]
}
```

**Response (201):**
```json
{
  "id": 10,
  "customer_id": 1,
  "status": "CREATED",
  "total_cents": 259800,
  "created_at": "2025-10-18T05:00:00.000Z",
  "updated_at": "2025-10-18T05:00:00.000Z",
  "items": [
    {
      "id": 15,
      "product_id": 1,
      "qty": 2,
      "unit_price_cents": 129900,
      "subtotal_cents": 259800,
      "sku": "LAPTOP-001",
      "name": "Business Laptop Pro 15\""
    }
  ]
}
```

**Validations:**
- Customer must exist (calls Customers API)
- All products must exist
- Sufficient stock must be available
- Stock is reserved (decremented) on order creation

#### Get Order by ID

```bash
GET /orders/:id
Authorization: Bearer <token>
```

#### Confirm Order (Idempotent)

```bash
POST /orders/:id/confirm
Authorization: Bearer <token>
X-Idempotency-Key: unique-key-123
Content-Type: application/json

{}
```

**Idempotency:**
- Same `X-Idempotency-Key` returns same result
- Prevents duplicate confirmations
- Idempotency keys stored in database

**Status Transition:**
- `CREATED` → `CONFIRMED` ✅
- `CONFIRMED` → `CONFIRMED` (idempotent) ✅
- `CANCELED` → Error ❌

#### Cancel Order

```bash
POST /orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{}
```

**Cancellation Rules:**
- `CREATED` orders: Can be canceled anytime, stock restored ✅
- `CONFIRMED` orders: Can be canceled within 10 minutes, stock restored ✅
- `CONFIRMED` orders after 10 minutes: Cannot be canceled ❌
- `CANCELED` orders: Cannot be canceled again ❌

**Status Transition:**
- `CREATED` → `CANCELED` ✅
- `CONFIRMED` (< 10 min) → `CANCELED` ✅
- `CONFIRMED` (> 10 min) → Error ❌

## 🔐 Authentication

### User Token (JWT)

```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDc2MDc0Mn0.8K7nFk5LJKyDFNUlc-bdZPkKMVNH7CtfQ1ttchP0eaM"

# Create order
curl -X POST http://localhost:3002/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1, "items": [{"product_id": 1, "qty": 2}]}'

# Confirm order
curl -X POST http://localhost:3002/orders/10/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Idempotency-Key: unique-key-$(date +%s)" \
  -d '{}'
```

## 🧪 Testing

**Test Suite:** 11/11 tests passing ✅

```bash
# Run all tests
npm test
```

**Test Coverage:**
- ✅ Health check endpoint
- ✅ GET /products/:id (with/without auth, 404)
- ✅ GET /products (search with/without auth)
- ✅ POST /orders (validation, auth)
- ✅ GET /orders/:id (auth)
- ✅ POST /orders/:id/confirm (auth, idempotency validation)

**Test Results:**
- All endpoints properly validate authentication (401 without token)
- 404 responses for non-existent resources
- 400 responses for invalid data
- Idempotency key validation working correctly

## 📚 API Documentation

**OpenAPI Specification:** [openapi.yaml](openapi.yaml)

View the documentation:
1. Open [https://editor.swagger.io](https://editor.swagger.io)
2. Load `orders-api/openapi.yaml`

Or use Swagger UI locally:
```bash
docker run -p 8080:8080 \
  -v "$PWD/openapi.yaml:/usr/share/nginx/html/openapi.yaml" \
  swaggerapi/swagger-ui
```

Then open: http://localhost:8080/?url=openapi.yaml

## ⚙️ Configuration

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=3307          # Docker mapped port
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=b2b_orders

# JWT
JWT_SECRET=b2b-orders-jwt-secret-key

# Customers API (for validation)
CUSTOMERS_API_BASE=http://localhost:3001
SERVICE_TOKEN=<service-token>

# Server
PORT=3002
```

### Database Connection

- **Development:** Uses `.env` file
- **Testing:** Uses `.env.test` file (port 3307 for Docker MySQL)
- **Docker:** Environment variables from `docker-compose.yml`

## 🗄️ Database Schema

### Products Table

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  price_cents INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  status ENUM('CREATED', 'CONFIRMED', 'CANCELED') NOT NULL DEFAULT 'CREATED',
  total_cents INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Order Items Table

```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL,
  unit_price_cents INT NOT NULL,
  subtotal_cents INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Idempotency Keys Table

```sql
CREATE TABLE idempotency_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_value VARCHAR(255) NOT NULL UNIQUE,
  target_type VARCHAR(50) NOT NULL,
  target_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  response_body JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start

# Run tests
npm test

# Build Docker image
docker build -t orders-api .

# Run Docker container
docker run -p 3002:3002 --env-file ../.env orders-api
```

## 📁 Project Structure

```
orders-api/
├── src/
│   ├── config/           # Database, JWT, logger, axios configuration
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Auth, validation, logging
│   ├── models/           # Database models
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── utils/            # Error classes
│   ├── schemas/          # Joi validation schemas
│   └── index.js          # App entry point
├── tests/                # Test suite
├── openapi.yaml          # API documentation
├── Dockerfile            # Docker configuration
└── package.json          # Dependencies
```

## 🔍 Key Features

### Stock Management
- Stock decremented on order creation
- Stock restored on order cancellation
- Database transactions ensure consistency
- Prevents overselling

### Order State Machine
```
CREATED ──confirm──> CONFIRMED
   │                     │
   │                     │
   └──cancel──> CANCELED <┘
                (< 10 min only)
```

### Idempotency
- Prevents duplicate order confirmations
- Uses `X-Idempotency-Key` header
- Stores keys in database with response
- Returns cached response for duplicate requests

### Customer Validation
- Validates customer exists via Customers API
- Uses service token for internal communication
- Fails order creation if customer not found

### Time-based Rules
- Confirmed orders can only be canceled within 10 minutes
- Prevents cancellation of shipped/processed orders

## 📖 Related Documentation

- [Main README](../README.md)
- [Customers API](../customers-api/README.md)
- [Lambda Orchestrator](../lambda-orchestrator/README.md)

## 📝 License

ISC
