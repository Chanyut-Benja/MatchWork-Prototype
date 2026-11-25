const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { io: Client } = require('../../client/node_modules/socket.io-client');
const db = require('../database/db');
const models = require('../database/models');
const messageRoutes = require('../routes/messageRoutes');
const { generateToken } = require('../middlewares/authMiddleware');

describe('Real-time Chat (Socket.io, Message Model & History API)', () => {
  let server;
  let ioServer;
  let baseUrl;
  let candToken;

  beforeAll((done) => {
    db.reset();
    candToken = generateToken({
      id: 'user_cand_1',
      email: 'kawin.dev@example.com',
      role: 'candidate',
      name: 'Kawin Suk',
      candidate_id: 'cand_1'
    });

    const app = express();
    app.use(express.json());
    app.use('/api', messageRoutes);
    app.use('/api/v1', messageRoutes);

    server = http.createServer(app);
    ioServer = new Server(server, {
      cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
    });

    ioServer.on('connection', (socket) => {
      socket.on('join_room', (payload) => {
        const connectionId = typeof payload === 'string' ? payload : payload?.connectionId;
        if (connectionId) socket.join(connectionId);
      });

      socket.on('send_message', async (payload, ack) => {
        const saved = await db.createMessage({
          connectionId: payload.connectionId,
          senderId: payload.senderId,
          content: payload.content
        });
        ioServer.to(payload.connectionId).emit('receive_message', saved);
        if (typeof ack === 'function') ack({ success: true, data: saved });
      });
    });

    server.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    ioServer.close();
    server.close(done);
  });

  test('Message model and associations with Connection & User are defined', () => {
    expect(models.Message).toBeDefined();
    expect(models.Message.associations.Connection).toBeDefined();
    expect(models.Message.associations.sender).toBeDefined();
    expect(models.Connection.associations.Messages).toBeDefined();
    expect(models.User.associations.Messages).toBeDefined();
  });

  test('GET /api/messages/:connectionId requires JWT authentication (401 without token)', async () => {
    const res = await fetch(`${baseUrl}/api/messages/cand_1_job_101`);
    expect(res.status).toBe(401);
  });

  test('Socket.io join_room, send_message, receive_message and GET /api/messages/:connectionId history', async () => {
    const connectionId = 'cand_1_job_101';

    const clientA = Client(baseUrl, { transports: ['websocket'] });
    const clientB = Client(baseUrl, { transports: ['websocket'] });

    await Promise.all([
      new Promise((resolve) => clientA.on('connect', resolve)),
      new Promise((resolve) => clientB.on('connect', resolve))
    ]);

    clientA.emit('join_room', { connectionId });
    clientB.emit('join_room', { connectionId });

    // Small tick to ensure both sockets joined the room
    await new Promise((r) => setTimeout(r, 40));

    const receivedByB = new Promise((resolve) => {
      clientB.once('receive_message', resolve);
    });

    const ackRes = await new Promise((resolve) => {
      clientA.emit(
        'send_message',
        {
          connectionId,
          senderId: 'user_cand_1',
          content: 'สวัสดีครับ สนใจนัดสัมภาษณ์เบื้องต้นครับ'
        },
        resolve
      );
    });

    const msgB = await receivedByB;

    expect(ackRes.success).toBe(true);
    expect(msgB.connectionId).toBe(connectionId);
    expect(msgB.senderId).toBe('user_cand_1');
    expect(msgB.content).toBe('สวัสดีครับ สนใจนัดสัมภาษณ์เบื้องต้นครับ');
    expect(msgB.createdAt).toBeDefined();

    clientA.disconnect();
    clientB.disconnect();

    const historyRes = await fetch(`${baseUrl}/api/messages/${connectionId}`, {
      headers: { Authorization: `Bearer ${candToken}` }
    });
    expect(historyRes.status).toBe(200);
    const body = await historyRes.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[body.data.length - 1].content).toBe('สวัสดีครับ สนใจนัดสัมภาษณ์เบื้องต้นครับ');
  });
});
