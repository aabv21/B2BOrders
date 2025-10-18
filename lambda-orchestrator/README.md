# Lambda Orchestrator

AWS Lambda function to orchestrate order creation and confirmation in a single operation.

## Features

- ✅ Validates customer exists
- ✅ Creates order with stock validation
- ✅ Confirms order with idempotency
- ✅ Returns consolidated response
- ✅ Correlation ID tracking
- ✅ Error handling and logging
- ✅ Local testing with serverless-offline
- ✅ AWS deployment ready
- ✅ Comprehensive tests with Mocha + Chai

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run locally with serverless-offline
npm run dev
```

The Lambda will be available at: `http://localhost:3000/orchestrator/create-and-confirm-order`

### Testing

```bash
# Run tests (requires APIs to be running)
npm test

# Test locally with curl
curl -X POST http://localhost:3000/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 2, "qty": 3}],
    "idempotency_key": "test-key-123",
    "correlation_id": "req-456"
  }'
```

## Request Format

```json
{
  "customer_id": 1,
  "items": [
    {"product_id": 2, "qty": 3},
    {"product_id": 3, "qty": 1}
  ],
  "idempotency_key": "unique-key-123",
  "correlation_id": "req-789"
}
```

## Response Format

### Success (201)

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

### Error (400/500)

```json
{
  "success": false,
  "correlationId": "req-789",
  "error": "Customer not found"
}
```

## AWS Deployment

### Prerequisites

- AWS CLI configured with credentials
- Serverless Framework installed
- Local APIs running (Customers API on port 3001, Orders API on port 3002)
- Proxy server running (see below)
- ngrok tunnel exposing the proxy server

### Proxy Server Setup

The Lambda needs to communicate with local APIs through a proxy server and ngrok tunnel:

```bash
# 1. Start the proxy server (from project root)
node proxy-server.js

# 2. Expose proxy with ngrok
ngrok http 4000

# 3. Update serverless.yml with ngrok URL
# CUSTOMERS_API_BASE: https://your-ngrok-url.ngrok-free.app
# ORDERS_API_BASE: https://your-ngrok-url.ngrok-free.app
```

### Deploy

```bash
# Deploy to AWS
npm run deploy

# View logs
npm run logs

# Remove deployment
npm run remove
```

### Current Deployment

**Endpoint:** `https://dflpbrmoel.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order`

**Test:**
```bash
curl -X POST https://dflpbrmoel.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 2}],
    "idempotency_key": "unique-key-123",
    "correlation_id": "req-456"
  }'
```

### Environment Variables

Configured in `serverless.yml`:

```yaml
environment:
  CUSTOMERS_API_BASE: https://your-ngrok-url.ngrok-free.app
  ORDERS_API_BASE: https://your-ngrok-url.ngrok-free.app
  SERVICE_TOKEN: <service-token-for-internal-endpoints>
  DEV_TOKEN: <user-token-for-orders-api>
```

**Note:** Tokens are generated without expiration using `node generate-token.js`

## Workflow

1. **Validate Customer** - Calls Customers API internal endpoint
2. **Create Order** - Calls Orders API to create order (validates stock)
3. **Confirm Order** - Calls Orders API to confirm order (idempotent)
4. **Return Response** - Returns consolidated customer + order data

## Error Handling

- Customer not found → 400
- Insufficient stock → 400
- Order creation failed → 500
- Order confirmation failed → 500
- Unexpected error → 500

All errors include correlation ID for tracking.

## Monitoring

Use AWS CloudWatch to monitor:
- Lambda invocations
- Error rates
- Duration
- Logs with correlation IDs

## Testing with Postman/Insomnia

Import the following request:

**POST** `http://localhost:3000/orchestrator/create-and-confirm-order`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "customer_id": 1,
  "items": [{"product_id": 2, "qty": 3}],
  "idempotency_key": "{{$timestamp}}",
  "correlation_id": "{{$guid}}"
}
```
