import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index.js';

chai.use(chaiHttp);
const { expect } = chai;

const TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDc2MDc0Mn0.8K7nFk5LJKyDFNUlc-bdZPkKMVNH7CtfQ1ttchP0eaM';

describe('Customers API', () => {
  describe('GET /health', () => {
    it('should return health status', (done) => {
      chai
        .request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('ok');
          expect(res.body.service).to.equal('customers-api');
          done();
        });
    });
  });

  describe('GET /customers/:id', () => {
    it('should return 401 without token', (done) => {
      chai
        .request(app)
        .get('/customers/1')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should get customer by id with valid token', (done) => {
      chai
        .request(app)
        .get('/customers/1')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id', 1);
          expect(res.body).to.have.property('name');
          expect(res.body).to.have.property('email');
          done();
        });
    });

    it('should return 404 for non-existent customer', (done) => {
      chai
        .request(app)
        .get('/customers/99999')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('GET /customers (search)', () => {
    it('should return 401 without token', (done) => {
      chai
        .request(app)
        .get('/customers?search=acme')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should search customers with valid token', (done) => {
      chai
        .request(app)
        .get('/customers?search=acme&limit=5')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });

  describe('POST /customers', () => {
    it('should return 401 without token', (done) => {
      chai
        .request(app)
        .post('/customers')
        .send({ name: 'Test', email: 'test@test.com', phone: '+1-555-0000' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should return 400 for invalid data', (done) => {
      chai
        .request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ name: 'A', email: 'invalid', phone: '123' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});
