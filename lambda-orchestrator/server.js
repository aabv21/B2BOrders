import express from 'express';
import orchestratorRoutes from './src/routes/orchestrator.routes.js';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lambda-orchestrator' });
});

// Routes
app.use('/orchestrator', orchestratorRoutes);

app.listen(PORT, () => {
  console.log(`\n🚀 Lambda Orchestrator running on http://localhost:${PORT}`);
  console.log(`📍 Endpoint: POST http://localhost:${PORT}/orchestrator/create-and-confirm-order`);
  console.log(`💚 Health: GET http://localhost:${PORT}/health\n`);
});
