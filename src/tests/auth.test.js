/**
 * Jest Unit & Integration Tests for Authentication, JWT & Admin Route Protection
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const http = require('http');

const db = require('../database/db');
const apiRoutes = require('../routes/api');
const {
  generateToken,
  verifyToken,
  authenticateToken,
  requireAdmin
} = require('../middlewares/authMiddleware');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', apiRoutes);
  return app;
}

function requestJson(server, method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe('Authentication, JWT & Admin Route Protection', () => {
  let server;

  beforeAll((done) => {
    db.reset();
    const app = createTestApp();
    server = app.listen(0, '127.0.0.1', done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('1. Password Hashing (bcryptjs)', () => {
    test('should hash password on registration and verify with bcrypt', async () => {
      const email = `test_${Date.now()}@example.com`;
      const plainPassword = 'SuperSecretPassword!123';

      const regRes = await requestJson(server, 'POST', '/api/v1/auth/register', {
        name: 'Test Candidate',
        email,
        password: plainPassword,
        role: 'candidate'
      });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      expect(regRes.body.token).toBeDefined();
      expect(regRes.body.user.password).toBeUndefined();

      const storedUser = db.findUserByEmail(email);
      expect(storedUser).toBeDefined();
      expect(storedUser.password).not.toBe(plainPassword);
      expect(storedUser.password.startsWith('$2')).toBe(true);
      expect(bcrypt.compareSync(plainPassword, storedUser.password)).toBe(true);
      expect(bcrypt.compareSync('wrong-password', storedUser.password)).toBe(false);
    });

    test('should authenticate valid password on login and reject wrong password', async () => {
      const okRes = await requestJson(server, 'POST', '/api/v1/auth/login', {
        email: 'kawin.dev@example.com',
        password: 'password123'
      });
      expect(okRes.status).toBe(200);
      expect(okRes.body.success).toBe(true);
      expect(okRes.body.token).toBeDefined();

      const failRes = await requestJson(server, 'POST', '/api/v1/auth/login', {
        email: 'kawin.dev@example.com',
        password: 'wrongpassword'
      });
      expect(failRes.status).toBe(401);
      expect(failRes.body.success).toBe(false);
    });
  });

  describe('2. JWT Generation & Verification (jsonwebtoken)', () => {
    test('generateToken() should embed userId and role in signed JWT', () => {
      const user = { id: 'user_cand_1', email: 'kawin.dev@example.com', role: 'candidate', name: 'Kawin' };
      const token = generateToken(user);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded.userId).toBe('user_cand_1');
      expect(decoded.role).toBe('candidate');
    });

    test('verifyToken() should reject tampered or invalid tokens', () => {
      const token = generateToken({ id: 'u1', role: 'candidate' });
      const tampered = token.slice(0, -4) + 'XXXX';

      expect(verifyToken(tampered)).toBeNull();
      expect(verifyToken('not.a.jwt')).toBeNull();
      expect(verifyToken('')).toBeNull();
    });

    test('verifyToken() should reject expired tokens', () => {
      const secret = process.env.JWT_SECRET || 'matchwork-jwt-secret-key-2026';
      const expiredToken = jwt.sign({ userId: 'u1', role: 'admin' }, secret, { expiresIn: '-10s' });
      expect(verifyToken(expiredToken)).toBeNull();
    });
  });

  describe('3. Middleware Unit Tests (authenticateToken & requireAdmin)', () => {
    function createMockRes() {
      const res = {
        statusCode: 200,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        }
      };
      return res;
    }

    test('authenticateToken should return 401 when Authorization header is missing', () => {
      const req = { headers: {} };
      const res = createMockRes();
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('authenticateToken should attach req.user and call next() for valid JWT', () => {
      const token = generateToken({ id: 'user_admin_1', email: 'admin@matchwork.io', role: 'admin', name: 'Admin' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = createMockRes();
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('user_admin_1');
      expect(req.user.role).toBe('admin');
    });

    test('requireAdmin should return 403 for non-admin user and call next() for admin', () => {
      const nonAdminReq = { user: { userId: 'user_cand_1', role: 'candidate' } };
      const nonAdminRes = createMockRes();
      const next1 = jest.fn();

      requireAdmin(nonAdminReq, nonAdminRes, next1);
      expect(nonAdminRes.statusCode).toBe(403);
      expect(next1).not.toHaveBeenCalled();

      const adminReq = { user: { userId: 'user_admin_1', role: 'admin' } };
      const adminRes = createMockRes();
      const next2 = jest.fn();

      requireAdmin(adminReq, adminRes, next2);
      expect(next2).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. Protected Routes & Account Switcher Integration', () => {
    test('Admin routes should deny unauthenticated (401) and non-admin (403), allow admin (200)', async () => {
      // Unauthenticated
      const noAuthRes = await requestJson(server, 'GET', '/api/v1/admin/stats');
      expect(noAuthRes.status).toBe(401);

      // Candidate login
      const candLogin = await requestJson(server, 'POST', '/api/v1/auth/login', { role: 'candidate' });
      const candToken = candLogin.body.token;

      const candAdminRes = await requestJson(server, 'GET', '/api/v1/admin/stats', null, {
        Authorization: `Bearer ${candToken}`
      });
      expect(candAdminRes.status).toBe(403);

      // Candidate can access protected /feed
      const candFeedRes = await requestJson(server, 'GET', '/api/v1/feed?role=candidate&id=cand_1', null, {
        Authorization: `Bearer ${candToken}`
      });
      expect(candFeedRes.status).toBe(200);

      // Admin login
      const adminLogin = await requestJson(server, 'POST', '/api/v1/auth/login', { role: 'admin' });
      const adminToken = adminLogin.body.token;

      const adminStatsRes = await requestJson(server, 'GET', '/api/v1/admin/stats', null, {
        Authorization: `Bearer ${adminToken}`
      });
      expect(adminStatsRes.status).toBe(200);
      expect(adminStatsRes.body.success).toBe(true);
    });

    test('Account Switcher (/api/v1/auth/switch) should issue fresh JWT for target persona', async () => {
      const switchRes = await requestJson(server, 'POST', '/api/v1/auth/switch', {
        persona_id: 'cand_2',
        role: 'candidate'
      });

      expect(switchRes.status).toBe(200);
      expect(switchRes.body.success).toBe(true);
      expect(switchRes.body.token).toBeDefined();
      expect(switchRes.body.user.candidate_id).toBe('cand_2');

      const decoded = verifyToken(switchRes.body.token);
      expect(decoded.userId).toBe(switchRes.body.user.id);
      expect(decoded.role).toBe('candidate');
    });
  });
});
