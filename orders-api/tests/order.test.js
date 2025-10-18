import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index.js';

chai.use(chaiHttp);
const { expect } = chai;

// Test token (generated without expiration)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDc2MDc0Mn0.8K7nFk5LJKyDFNUlc-bdZPkKMVNH7CtfQ1ttchP0eaM';

describe('Orders API', () => {
  describe('GET /health', () => {
    it('should return health status', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('ok');
          expect(res.body.service).to.equal('orders-api');
          done();
        });
    });
  });

  describe('GET /products/:id', () => {
    it('should return 401 without token', (done) => {
      chai.request(app)
        .get('/products/1')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should get product by id with valid token', (done) => {
      chai.request(app)
        .get('/products/1')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id', 1);
          expect(res.body).to.have.property('name');
          expect(res.body).to.have.property('price_cents');
          expect(res.body).to.have.property('stock');
          done();
        });
    });

    it('should return 404 for non-existent product', (done) => {
      chai.request(app)
        .get('/products/99999')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('GET /products (search)', () => {
    it('should return 401 without token', (done) => {
      chai.request(app)
        .get('/products?search=laptop')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should search products with valid token', (done) => {
      chai.request(app)
        .get('/products?search=laptop&limit=5')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });

  describe('POST /orders', () => {
    it('should return 401 without token', (done) => {
      chai.request(app)
        .post('/orders')
        .send({ customer_id: 1, items: [{ product_id: 1, qty: 1 }] })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should return 400 for invalid data', (done) => {
      chai.request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ customer_id: 'invalid', items: [] })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('GET /orders/:id', () => {
    it('should return 401 without token', (done) => {
      chai.request(app)
        .get('/orders/1')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  describe('POST /orders/:id/confirm', () => {
    it('should return 401 without token', (done) => {
      chai.request(app)
        .post('/orders/1/confirm')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should return 400 without idempotency key', (done) => {
      chai.request(app)
        .post('/orders/1/confirm')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});
