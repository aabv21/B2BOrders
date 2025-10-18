# Orders API

REST API for managing B2B products and orders with stock control, validation, and idempotency.

## Features

- ✅ Product management (CRUD operations)
- ✅ Order creation with stock validation
- ✅ Customer validation via Customers API
- ✅ Automatic total calculation
- ✅ Stock management with transactions
- ✅ Order confirmation with idempotency
- ✅ Order cancellation with stock restoration
- ✅ Time-based cancellation rules
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

### Products

- `POST /products` - Create product
- `GET /products/:id` - Get product by ID
- `GET /products?search=&cursor=&limit=` - Search products
- `PATCH /products/:id` - Update product price/stock

### Orders

- `POST /orders` - Create order
- `GET /orders/:id` - Get order with items
- `GET /orders?status=&from=&to=&cursor=&limit=` - Search orders
- `POST /orders/:id/confirm` - Confirm order (idempotent)
- `POST /orders/:id/cancel` - Cancel order

## Business Rules

### Order Creation
1. Validates customer exists (via Customers API)
2. Validates all products exist
3. Checks stock availability
4. Calculates totals automatically
5. Decreases stock atomically
6. Creates order in CREATED status

### Order Confirmation
- Requires X-Idempotency-Key header
- Changes status from CREATED to CONFIRMED
- Idempotent (same key returns same response)
- Stores key for 24 hours

### Order Cancellation
- CREATED orders: can be canceled anytime
- CONFIRMED orders: can only be canceled within 10 minutes
- Automatically restores stock
- Uses database transactions

## Environment Variables

```bash
ORDERS_API_PORT=3002
CUSTOMERS_API_BASE=http://localhost:3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=b2b_orders
SERVICE_TOKEN=your-service-token
```

## Testing

**Test Suite:** 11/11 tests passing ✅

```bash
# Run all tests
npm test

# Test Coverage:
# ✅ Health check endpoint
# ✅ GET /products/:id (with/without auth, 404)
# ✅ GET /products (search with/without auth)
# ✅ POST /orders (validation, auth)
# ✅ GET /orders/:id (auth)
# ✅ POST /orders/:id/confirm (auth, idempotency validation)
```

**Test Results:**
- All endpoints properly validate authentication
- 401 responses for missing tokens
- 404 responses for non-existent resources
- 400 responses for invalid data
- Idempotency key validation working correctly

## Documentation

See `openapi.yaml` for complete API specification.
