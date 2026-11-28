/**
 * Jest Integration Tests for Settings & Account Endpoints
 */
const express = require('express');
const http = require('http');

const db = require('../database/db');
const apiRoutes = require('../routes/api');
const { generateToken } = require('../middlewares/authMiddleware');

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
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
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

describe('Settings & Account API', () => {
  let server;
  let token;

  beforeAll((done) => {
    db.reset();
    const user = db.findUserByEmail('kawin.dev@example.com');
    token = generateToken(user);
    const app = createTestApp();
    server = app.listen(0, done);
  });

  afterAll((done) => {
    if (server) server.close(done);
    else done();
  });

  test('GET /api/v1/settings/account returns notification preferences, 2FA, appearance, and devices', async () => {
    const res = await requestJson(server, 'GET', '/api/v1/settings/account', null, {
      Authorization: `Bearer ${token}`,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notification_preferences).toBeDefined();
    expect(Array.isArray(res.body.data.devices)).toBe(true);
    expect(res.body.data.devices.length).toBeGreaterThanOrEqual(2);
  });

  test('PUT /api/v1/settings/notifications updates channels and events', async () => {
    const res = await requestJson(
      server,
      'PUT',
      '/api/v1/settings/notifications',
      {
        channels: { email: false, push: true, in_app: true },
        events: { new_matching_job: true, new_match: false, hr_reply: true },
      },
      { Authorization: `Bearer ${token}` }
    );
    expect(res.status).toBe(200);
    expect(res.body.data.notification_preferences.channels.email).toBe(false);
    expect(res.body.data.notification_preferences.events.new_match).toBe(false);
  });

  test('PUT /api/v1/settings/security/2fa enables 2FA and returns setup code', async () => {
    const res = await requestJson(
      server,
      'PUT',
      '/api/v1/settings/security/2fa',
      { enabled: true, method: 'authenticator' },
      { Authorization: `Bearer ${token}` }
    );
    expect(res.status).toBe(200);
    expect(res.body.data.two_factor_enabled).toBe(true);
    expect(res.body.data.setup_code).toBeTruthy();
  });

  test('POST /api/v1/settings/security/password validates current password and updates password', async () => {
    const badRes = await requestJson(
      server,
      'POST',
      '/api/v1/settings/security/password',
      { current_password: 'wrongpassword', new_password: 'newpassword123' },
      { Authorization: `Bearer ${token}` }
    );
    expect(badRes.status).toBe(400);

    const okRes = await requestJson(
      server,
      'POST',
      '/api/v1/settings/security/password',
      { current_password: 'password123', new_password: 'newpassword123' },
      { Authorization: `Bearer ${token}` }
    );
    expect(okRes.status).toBe(200);
    expect(okRes.body.success).toBe(true);
  });

  test('PUT /api/v1/settings/appearance updates language and theme preference', async () => {
    const res = await requestJson(
      server,
      'PUT',
      '/api/v1/settings/appearance',
      { language: 'en', theme_preference: 'dark' },
      { Authorization: `Bearer ${token}` }
    );
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ language: 'en', theme_preference: 'dark' });
  });

  test('DELETE /api/v1/settings/security/devices revokes non-current devices', async () => {
    const res = await requestJson(
      server,
      'DELETE',
      '/api/v1/settings/security/devices',
      null,
      { Authorization: `Bearer ${token}` }
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].is_current).toBe(true);
  });

  test('POST /api/v1/seekers/profile persists portfolio, github, linkedin, and resume fields', async () => {
    const res = await requestJson(
      server,
      'POST',
      '/api/v1/seekers/profile',
      {
        full_name: 'Kawin Suk',
        email: 'kawin.dev@example.com',
        title: 'Senior Full-Stack Engineer',
        portfolio_url: 'https://kawin.dev',
        github_url: 'https://github.com/kawin',
        linkedin_url: 'https://linkedin.com/in/kawin',
        resume_filename: 'kawin_cv.pdf',
      },
      { Authorization: `Bearer ${token}` }
    );
    expect(res.status).toBe(200);
    expect(res.body.data.profile.portfolio_url).toBe('https://kawin.dev');
    expect(res.body.data.profile.github_url).toBe('https://github.com/kawin');
    expect(res.body.data.profile.linkedin_url).toBe('https://linkedin.com/in/kawin');
    expect(res.body.data.profile.resume_filename).toBe('kawin_cv.pdf');
  });
});
