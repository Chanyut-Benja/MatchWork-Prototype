/**
 * Jest Integration Tests for Discovery & Matching:
 * - Advanced Filters (salary, work_style, location, distance, experience, employment_type)
 * - Smart Match Reasons (matched_skills, missing_skills, fit_reasons)
 * - Saved Jobs & Deadline Reminders
 * - History & Undo
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

describe('Discovery & Matching API', () => {
  let server;
  let candidateToken;

  beforeEach(async () => {
    db.reset();
    const app = createTestApp();
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    const user = db.findUserById('user_cand_1');
    candidateToken = generateToken(user);
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('GET /api/v1/feed supports advanced filters (salary, work_style, location, distance, exp, employment_type)', async () => {
    const auth = { Authorization: `Bearer ${candidateToken}` };

    // Filter by remote work_style
    const remoteRes = await requestJson(
      server,
      'GET',
      '/api/v1/feed?role=candidate&id=cand_1&work_style=remote',
      null,
      auth
    );
    expect(remoteRes.status).toBe(200);
    expect(remoteRes.body.data.length).toBeGreaterThan(0);
    expect(remoteRes.body.data.every((j) => j.work_style === 'remote')).toBe(true);

    // Filter by contract employment_type
    const contractRes = await requestJson(
      server,
      'GET',
      '/api/v1/feed?role=candidate&id=cand_1&employment_type=contract',
      null,
      auth
    );
    expect(contractRes.status).toBe(200);
    expect(contractRes.body.data.some((j) => j.card_id === 'job_105')).toBe(true);
    expect(contractRes.body.data.every((j) => j.employment_type === 'contract')).toBe(true);

    // Filter by max_distance_km=50 from Bangkok (cand_1) excludes Chiang Mai job_105
    const nearRes = await requestJson(
      server,
      'GET',
      '/api/v1/feed?role=candidate&id=cand_1&max_distance_km=50',
      null,
      auth
    );
    expect(nearRes.status).toBe(200);
    expect(nearRes.body.data.some((j) => j.card_id === 'job_105')).toBe(false);
    expect(nearRes.body.data.every((j) => typeof j.distance_km === 'number' && j.distance_km <= 50)).toBe(true);

    // Filter by min_salary & max_exp
    const salExpRes = await requestJson(
      server,
      'GET',
      '/api/v1/feed?role=candidate&id=cand_1&min_salary=90000&max_exp=4',
      null,
      auth
    );
    expect(salExpRes.status).toBe(200);
    expect(
      salExpRes.body.data.every((j) => j.max_salary >= 90000 && j.experience_requirement <= 4)
    ).toBe(true);
  });

  test('GET /api/v1/interactions returns saved jobs with deadline countdown & closing_soon_count', async () => {
    const res = await requestJson(
      server,
      'GET',
      '/api/v1/interactions?role=candidate&id=cand_1&action=save',
      null,
      { Authorization: `Bearer ${candidateToken}` }
    );
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    // Seeded saved interaction is cand_1 -> job_102 (closes in 2 days)
    const saved = res.body.data.find((i) => i.job_id === 'job_102');
    expect(saved).toBeDefined();
    expect(saved.is_closing_soon).toBe(true);
    expect(saved.days_until_deadline).toBeLessThanOrEqual(5);
    expect(res.body.closing_soon_count).toBeGreaterThan(0);
  });

  test('POST /api/v1/interactions/undo removes latest swipe and restores card to feed', async () => {
    const auth = { Authorization: `Bearer ${candidateToken}` };

    // Skip job_101
    const skipRes = await requestJson(
      server,
      'POST',
      '/api/v1/interactions',
      {
        candidate_id: 'cand_1',
        job_id: 'job_101',
        initiator_role: 'candidate',
        action: 'skip',
      },
      auth
    );
    expect(skipRes.status).toBe(201);

    // Verify job_101 is hidden from feed
    const feedAfterSkip = await requestJson(
      server,
      'GET',
      '/api/v1/feed?role=candidate&id=cand_1',
      null,
      auth
    );
    expect(feedAfterSkip.body.data.some((j) => j.card_id === 'job_101')).toBe(false);

    // Undo latest interaction
    const undoRes = await requestJson(
      server,
      'POST',
      '/api/v1/interactions/undo',
      { role: 'candidate', id: 'cand_1' },
      auth
    );
    expect(undoRes.status).toBe(200);
    expect(undoRes.body.success).toBe(true);
    expect(undoRes.body.undone.job_id).toBe('job_101');

    // Verify job_101 reappears in feed
    const feedAfterUndo = await requestJson(
      server,
      'GET',
      '/api/v1/feed?role=candidate&id=cand_1',
      null,
      auth
    );
    expect(feedAfterUndo.body.data.some((j) => j.card_id === 'job_101')).toBe(true);
  });
});
