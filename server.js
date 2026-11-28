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

// Authenticate socket connection via JWT token
io.use((socket, next) => {
  const rawAuth = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (!rawAuth || typeof rawAuth !== 'string') {
    return next(new Error('Unauthorized: Missing JWT token'));
  }

  const token = rawAuth.startsWith('Bearer ') ? rawAuth.slice(7) : rawAuth;
  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new Error('Unauthorized: Invalid or expired JWT token'));
  }

  socket.user = {
    id: decoded.userId || decoded.sub,
    userId: decoded.userId || decoded.sub,
    email: decoded.email,
    role: decoded.role,
    name: decoded.name,
    candidate_id: decoded.candidate_id || null,
    job_id: decoded.job_id || null
  };
  next();
});

function canAccessConnection(user, connectionId) {
  if (!user || !connectionId) return false;
  if ((user.role || '').toLowerCase() === 'admin') return true;
  if (user.candidate_id && connectionId.startsWith(`${user.candidate_id}_`)) return true;
  if (user.job_id && connectionId.endsWith(`_${user.job_id}`)) return true;
  return false;
}

io.on('connection', (socket) => {
  socket.on('join_room', (payload, ack) => {
    const rawId = typeof payload === 'string' ? payload : payload?.connectionId;
    const connectionId = typeof rawId === 'string' ? rawId.trim() : '';
    if (!connectionId || !canAccessConnection(socket.user, connectionId)) {
      if (typeof ack === 'function') {
        ack({ success: false, message: 'Forbidden or invalid connectionId' });
      }
      return;
    }
    socket.join(connectionId);
    if (typeof ack === 'function') {
      ack({ success: true, connectionId });
    }
  });

  socket.on('send_message', async (payload, ack) => {
    try {
      const connectionId = payload?.connectionId ? String(payload.connectionId).trim() : '';
      const content = payload?.content ? String(payload.content).trim() : '';
      const senderId = socket.user?.id;

      if (!connectionId || !senderId || !content) {
        if (typeof ack === 'function') {
          ack({ success: false, message: 'connectionId and content are required' });
        }
        return;
      }

      if (!canAccessConnection(socket.user, connectionId)) {
        if (typeof ack === 'function') {
          ack({ success: false, message: 'Forbidden: You are not a participant of this conversation' });
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

// Start Server and initialize database
async function startServer() {
  // Initialize Database connection (MySQL or PostgreSQL via Sequelize)
  await db.initDatabase();

  if (!isProduction) {
    // Mount Vite dev server in middleware mode so API, Socket.IO, and React share a single port
    const { pathToFileURL } = require('url');
    const viteEntry = require.resolve('vite', { paths: [path.join(__dirname, 'client')] });
    const { createServer: createViteServer } = await import(pathToFileURL(viteEntry).href);
    const vite = await createViteServer({
      root: path.join(__dirname, 'client'),
      configFile: path.join(__dirname, 'client', 'vite.config.js'),
      server: {
        middlewareMode: true,
        hmr: { server, path: '/__vite_hmr' }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Static files (React SPA from client/dist) in production
    const staticDir = path.join(__dirname, 'client', 'dist');
    const fs = require('fs');

    app.use(express.static(staticDir, {
      etag: true,
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        }
      }
    }));

    app.get('*', (req, res) => {
      const indexPath = path.join(staticDir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        return res.status(404).json({
          success: false,
          message: 'Frontend build not found. Run npm run build:client first.'
        });
      }
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.sendFile(indexPath);
    });
  }

  server.listen(PORT, () => {
    console.log('========================================================');
    console.log(`🚀 MatchWork Server running (${isProduction ? 'production' : 'development'}) at:`);
    console.log(`👉 http://localhost:${PORT} (Single Port: Frontend + API + Socket.IO)`);
    console.log(`🗄️ Database dialect configured: ${process.env.DB_DIALECT || 'mysql'}`);
    console.log('========================================================');
  });
}

startServer();
