# Lambda Orchestrator

AWS Lambda function that orchestrates the complete order workflow: validate customer → create order → confirm order.

## 📋 Overview

This serverless function provides an atomic operation to create and confirm orders in a single HTTP request, coordinating calls to the Customers API and Orders API.

## 🚀 Current Deployment

**AWS Lambda Endpoint:**
```
https://dflpbrmoel.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order
```

**Region:** us-east-1  
**Runtime:** Node.js 20.x  
**Framework:** Serverless Framework

## 📡 API Endpoint

### POST /orchestrator/create-and-confirm-order

Creates an order and confirms it atomically with idempotency guarantee.

**Request:**
```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "qty": 2
    }
  ],
  "idempotency_key": "unique-key-123",
  "correlation_id": "optional-trace-id"
}
```

**Response (201):**
```json
{
  "success": true,
  "correlationId": "optional-trace-id",
  "data": {
    "customer": {
      "id": 1,
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "phone": "+1-555-0100"
    },
    "order": {
      "id": 23,
      "status": "CONFIRMED",
      "total_cents": 259800,
      "items": [...]
    }
  }
}
```

**Error Responses:**
- `400` - Missing or invalid fields
- `404` - Customer or product not found
- `409` - Insufficient stock or duplicate idempotency key
- `500` - Internal orchestration error

## 🧪 Testing the Lambda

```bash
# Test current deployment
curl -X POST https://dflpbrmoel.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 2}],
    "idempotency_key": "test-'$(date +%s)'",
    "correlation_id": "test-request"
  }'
```

## 🔧 Local Development

### Run Locally with Express

```bash
# Start local server (port 3000)
npm run dev

# Test locally
curl -X POST http://localhost:3000/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 2}],
    "idempotency_key": "local-test",
    "correlation_id": "local-req"
  }'
```

### Run with Serverless Offline

```bash
# Start serverless-offline (port 3000)
npm run dev:serverless

# Test
curl -X POST http://localhost:3000/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1, "items": [{"product_id": 1, "qty": 1}], "idempotency_key": "test"}'
```

## 📦 Deployment to AWS

### Prerequisites

- AWS CLI configured with credentials
- Serverless Framework installed globally: `npm install -g serverless`
- Local APIs running (Customers + Orders)
- ngrok account (free tier works)

### Step-by-Step Deployment

#### 1. Start Local Services

```bash
# Terminal 1: Start Docker services
cd ..
docker-compose up

# Terminal 2: Start proxy server
node proxy-server.js
# Proxy runs on http://localhost:4000
```

#### 2. Expose with ngrok

```bash
# Terminal 3: Start ngrok
ngrok http 4000

# Copy the ngrok URL from output:
# Example: https://1e4d208945fe.ngrok-free.app
```

#### 3. Update Configuration

Edit `serverless.yml` and update the environment variables:

```yaml
environment:
  CUSTOMERS_API_BASE: https://YOUR-NGROK-URL.ngrok-free.app  # Replace with your ngrok URL
  ORDERS_API_BASE: https://YOUR-NGROK-URL.ngrok-free.app     # Replace with your ngrok URL
  SERVICE_TOKEN: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    # Keep as is
  DEV_TOKEN: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...         # Keep as is
```

#### 4. Deploy

```bash
# Deploy to AWS
npm run deploy

# Output will show your Lambda endpoint:
# endpoint: POST - https://xxx.execute-api.us-east-1.amazonaws.com/orchestrator/create-and-confirm-order
```

#### 5. Test Deployment

```bash
curl -X POST https://YOUR-LAMBDA-URL/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 1}],
    "idempotency_key": "deploy-test-'$(date +%s)'",
    "correlation_id": "deploy-test"
  }'
```

## 🔄 Redeployment

**Important:** ngrok URLs change every time you restart ngrok (free tier).

After restarting ngrok:
1. Get new ngrok URL
2. Update `serverless.yml` with new URL
3. Redeploy: `npm run deploy`

## 📊 Monitoring

### View Logs

```bash
# Tail Lambda logs
npm run logs

# Or use AWS CLI
aws logs tail /aws/lambda/b2b-orders-orchestrator-dev-createAndConfirmOrder --follow
```

### CloudWatch Logs

Logs are available in AWS CloudWatch:
- Log Group: `/aws/lambda/b2b-orders-orchestrator-dev-createAndConfirmOrder`
- Region: us-east-1

## 🗑️ Remove Deployment

```bash
# Remove Lambda and API Gateway
npm run remove
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  AWS Lambda (us-east-1)             │
│  Orchestrator Function              │
│  - Validates customer               │
│  - Creates order                    │
│  - Confirms order (idempotent)      │
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
│  - Routes to Customers API           │
│  - Routes to Orders API              │
└──────────┬───────────────────────────┘
           │
           ├──────────────┬─────────────┐
           │              │             │
           ▼              ▼             ▼
┌──────────────┐  ┌────────────┐  ┌──────────┐
│ Customers API│  │ Orders API │  │  MySQL   │
│  Port 3001   │  │ Port 3002  │  │Port 3307 │
└──────────────┘  └────────────┘  └──────────┘
```

## 📝 Configuration

### Environment Variables

- `CUSTOMERS_API_BASE` - Base URL for Customers API (via ngrok)
- `ORDERS_API_BASE` - Base URL for Orders API (via ngrok)
- `SERVICE_TOKEN` - JWT token for Customers API internal endpoints
- `DEV_TOKEN` - JWT token for Orders API endpoints

### Serverless Configuration

Key settings in `serverless.yml`:
- **Runtime:** nodejs20.x
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Region:** us-east-1
- **Bundler:** esbuild (fast builds)

## 🔍 Workflow Steps

1. **Validate Customer** - Calls `GET /internal/customers/:id` on Customers API
2. **Create Order** - Calls `POST /orders` on Orders API (validates stock, calculates total)
3. **Confirm Order** - Calls `POST /orders/:id/confirm` on Orders API (idempotent with X-Idempotency-Key)

If any step fails, the error is mapped and returned to the client.

## 📚 Related Documentation

- [Main README](../README.md)
- [Customers API](../customers-api/README.md)
- [Orders API](../orders-api/README.md)
- [Proxy Server Setup](../PROXY-README.md) (if exists)

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run locally with Express
npm run dev

# Run with serverless-offline
npm run dev:serverless

# Deploy to AWS
npm run deploy

# View logs
npm run logs

# Remove deployment
npm run remove
```

## ⚠️ Important Notes

- Lambda requires ngrok tunnel to access local APIs
- ngrok free tier URLs change on restart - requires redeployment
- Tokens are configured without expiration for development
- For production, use proper secrets management (AWS Secrets Manager)
- Consider deploying APIs to AWS for production use
