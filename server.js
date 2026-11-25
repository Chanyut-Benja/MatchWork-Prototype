/**
 * MatchWork - Interactive Prototype Server
 * Node.js + Express.js RESTful API & Single Page Application
 */
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const db = require('./src/database/db');
const apiRoutes = require('./src/routes/api');
const messageRoutes = require('./src/routes/messageRoutes');
const { verifyToken } = require('./src/middlewares/authMiddleware');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : isProduction
    ? false
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Authenticate socket connection if JWT token is provided
io.use((socket, next) => {
  const rawAuth = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (rawAuth && typeof rawAuth === 'string') {
    const token = rawAuth.startsWith('Bearer ') ? rawAuth.slice(7) : rawAuth;
    const decoded = verifyToken(token);
    if (decoded) {
      socket.user = {
        id: decoded.userId || decoded.sub,
        userId: decoded.userId || decoded.sub,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      };
    }
  }
  next();
});

io.on('connection', (socket) => {
  socket.on('join_room', (payload) => {
    const connectionId = typeof payload === 'string' ? payload : payload?.connectionId;
    if (!connectionId || typeof connectionId !== 'string') return;
    socket.join(connectionId.trim());
  });

  socket.on('send_message', async (payload, ack) => {
    try {
      const connectionId = payload?.connectionId ? String(payload.connectionId).trim() : '';
      const content = payload?.content ? String(payload.content).trim() : '';
      const senderId = socket.user?.id || (payload?.senderId ? String(payload.senderId).trim() : '');

      if (!connectionId || !senderId || !content) {
        if (typeof ack === 'function') {
          ack({ success: false, message: 'connectionId, senderId, and content are required' });
        }
        return;
      }

      const savedMessage = await db.createMessage({
        connectionId,
        senderId,
        content
      });

      io.to(connectionId).emit('receive_message', savedMessage);

      if (typeof ack === 'function') {
        ack({ success: true, data: savedMessage });
      }
    } catch (err) {
      console.error('Socket send_message error:', err.message);
      if (typeof ack === 'function') {
        ack({ success: false, message: 'Failed to send message' });
      }
    }
  });
});

// Middlewares
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// REST API Routes
app.use('/api/v1', apiRoutes);
app.use('/api', messageRoutes);

// Static files (SPA Frontend)
const staticDir = isProduction
  ? path.join(__dirname, 'client', 'dist')
  : path.join(__dirname, 'public');

app.use(express.static(staticDir, {
  etag: isProduction,
  maxAge: isProduction ? '1d' : 0,
  setHeaders: (res, filePath) => {
    if (!isProduction || filePath.endsWith('index.html')) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
  }
}));

// Fallback to index.html for SPA (React Client-side routing)
app.get('*', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Start Server and initialize database
async function startServer() {
  // Initialize Database connection (MySQL or PostgreSQL via Sequelize)
  await db.initDatabase();

  server.listen(PORT, () => {
    const corsLabel = isProduction
      ? (process.env.CORS_ORIGIN || 'Same-origin')
      : 'http://localhost:5173';
    console.log('========================================================');
    console.log(`🚀 MatchWork Server running (${isProduction ? 'production' : 'development'}) at:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`📦 Serving frontend from: ${isProduction ? 'client/dist' : 'public'}`);
    console.log(`💬 Socket.io Real-time Chat enabled (CORS: ${corsLabel})`);
    console.log(`🔒 Passwords secured with bcrypt hashing`);
    console.log(`🗄️ Database dialect configured: ${process.env.DB_DIALECT || 'mysql'}`);
    console.log('========================================================');
  });
}

startServer();
