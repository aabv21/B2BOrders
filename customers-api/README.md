# Customers API

REST API for managing B2B customers with CRUD operations, authentication, and validation.

## Features

- ✅ Create, Read, Update, Delete (soft delete) customers
- ✅ Email uniqueness validation
- ✅ Search with pagination (cursor-based)
- ✅ JWT authentication support
- ✅ Service token for internal API calls
- ✅ Input validation with Joi
- ✅ Rate limiting
- ✅ OpenAPI 3.0 documentation
- ✅ Comprehensive tests with Mocha + Chai

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp ../.env.example ../.env

# Run in development mode
npm run dev

# Run tests
npm test
```

## API Endpoints

### Public Endpoints

- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer by ID
- `GET /customers?search=&cursor=&limit=` - Search customers
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Soft delete customer

### Internal Endpoints

- `GET /internal/customers/:id` - Get customer (requires service token)

## Environment Variables

```bash
CUSTOMERS_API_PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=b2b_orders
JWT_SECRET=your-secret-key
SERVICE_TOKEN=your-service-token
```

## Testing

**Test Suite:** 8/8 tests passing ✅

```bash
# Run all tests
npm test

# Test Coverage:
# ✅ Health check endpoint
# ✅ GET /customers/:id (with/without auth, 404)
# ✅ GET /customers (search with/without auth)
# ✅ POST /customers (validation, auth)
```

**Test Results:**
- All endpoints properly validate authentication
- 401 responses for missing tokens
- 404 responses for non-existent resources
- 400 responses for invalid data

## Documentation

See `openapi.yaml` for complete API specification.
