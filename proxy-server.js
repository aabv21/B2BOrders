import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

// Proxy for Customers API - internal routes
app.all('/internal/customers*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:3001${req.path}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: 'Proxy error' });
  }
});

// Proxy for Customers API - public routes
app.all('/customers*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:3001${req.path}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: 'Proxy error' });
  }
});

// Proxy for Orders API
app.all('/orders*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:3002${req.path}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: 'Proxy error' });
  }
});

app.listen(4000, () => {
  console.log('🔄 Proxy running on http://localhost:4000');
  console.log(
    '   /internal/customers/* → http://localhost:3001 (Customers API - Internal)'
  );
  console.log(
    '   /customers/* → http://localhost:3001 (Customers API - Public)'
  );
  console.log('   /orders/* → http://localhost:3002 (Orders API)');
});
