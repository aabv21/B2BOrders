# Customers API

REST API for managing B2B customer data with CRUD operations, authentication, and validation.

## 📋 Features

- ✅ Create, Read, Update, Delete (soft delete) customers
- ✅ Email uniqueness validation
- ✅ Cursor-based pagination for search
- ✅ JWT authentication
- ✅ Service token for internal endpoints
- ✅ Input validation with Joi
- ✅ Rate limiting
- ✅ OpenAPI 3.0 documentation
- ✅ Comprehensive test suite (8/8 passing)

## 🚀 Quick Start

### Run with Docker Compose

```bash
# From project root
docker-compose up customers-api

# Verify it's running
curl http://localhost:3001/health
```

### Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:3001
```

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

No authentication required.

### Customer Management

All endpoints require JWT Bearer token authentication.

#### Create Customer

```bash
POST /customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Solutions Inc",
  "email": "contact@techsolutions.com",
  "phone": "+1-555-1234"
}
```

**Response (201):**
```json
{
  "id": 5,
  "name": "Tech Solutions Inc",
  "email": "contact@techsolutions.com",
  "phone": "+1-555-1234",
  "created_at": "2025-10-18T05:00:00.000Z",
  "updated_at": "2025-10-18T05:00:00.000Z",
  "deleted_at": null
}
```

#### Get Customer by ID

```bash
GET /customers/:id
Authorization: Bearer <token>
```

#### Search Customers

```bash
GET /customers?search=acme&cursor=0&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` - Search term (searches name, email, phone)
- `cursor` - Pagination cursor (default: 0)
- `limit` - Results per page (default: 10, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "phone": "+1-555-0100"
    }
  ],
  "pagination": {
    "cursor": 0,
    "limit": 10,
    "hasMore": false
  }
}
```

#### Update Customer

```bash
PUT /customers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1-555-9999"
}
```

#### Delete Customer (Soft Delete)

```bash
DELETE /customers/:id
Authorization: Bearer <token>
```

Sets `deleted_at` timestamp. Customer is excluded from search results.

### Internal Endpoints

#### Get Customer (Internal)

```bash
GET /internal/customers/:id
X-Service-Token: <service-token>
```

Used by other microservices. Requires service token instead of JWT.

## 🔐 Authentication

### User Token (JWT)

```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDc2MDc0Mn0.8K7nFk5LJKyDFNUlc-bdZPkKMVNH7CtfQ1ttchP0eaM"

curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/customers/1
```

### Service Token (for internal endpoints)

```bash
export SERVICE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoib3JjaGVzdHJhdG9yIiwicHVycG9zZSI6ImludGVybmFsLWNvbW11bmljYXRpb24iLCJpYXQiOjE3NjA3MjcwMDF9.6UvvYEpgLhiKPftk1AYX0A3PCPSLy0FELqWRb6y1Fqg"

curl -H "X-Service-Token: $SERVICE_TOKEN" http://localhost:3001/internal/customers/1
```

## 🧪 Testing

**Test Suite:** 8/8 tests passing ✅

```bash
# Run all tests
npm test
```

**Test Coverage:**
- ✅ Health check endpoint
- ✅ GET /customers/:id (with/without auth, 404)
- ✅ GET /customers (search with/without auth)
- ✅ POST /customers (validation, auth)

**Test Results:**
- All endpoints properly validate authentication (401 without token)
- 404 responses for non-existent resources
- 400 responses for invalid data

## 📚 API Documentation

**OpenAPI Specification:** [openapi.yaml](openapi.yaml)

View the documentation:
1. Open [https://editor.swagger.io](https://editor.swagger.io)
2. Load `customers-api/openapi.yaml`

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

# Service Token
SERVICE_SECRET=b2b-orders-service-internal-secret-key

# Server
PORT=3001
```

### Database Connection

- **Development:** Uses `.env` file
- **Testing:** Uses `.env.test` file (port 3307 for Docker MySQL)
- **Docker:** Environment variables from `docker-compose.yml`

## 🗄️ Database Schema

```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_deleted_at (deleted_at)
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
docker build -t customers-api .

# Run Docker container
docker run -p 3001:3001 --env-file ../.env customers-api
```

## 📁 Project Structure

```
customers-api/
├── src/
│   ├── config/           # Database, JWT, logger configuration
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Auth, validation, logging
│   ├── models/           # Database models
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── utils/            # Error classes
│   ├── validators/       # Joi schemas
│   └── index.js          # App entry point
├── tests/                # Test suite
├── openapi.yaml          # API documentation
├── Dockerfile            # Docker configuration
└── package.json          # Dependencies
```

## 🔍 Key Features

### Soft Delete
Customers are never permanently deleted. The `DELETE` endpoint sets `deleted_at` timestamp.

### Email Uniqueness
Email addresses must be unique across all customers (including soft-deleted ones).

### Cursor-based Pagination
Efficient pagination using cursor (last seen ID) instead of offset.

### Rate Limiting
Prevents abuse with configurable rate limits per IP.

### Input Validation
All inputs validated with Joi schemas before processing.

## 📖 Related Documentation

- [Main README](../README.md)
- [Orders API](../orders-api/README.md)
- [Lambda Orchestrator](../lambda-orchestrator/README.md)

## 📝 License

ISC
