/**
 * SYJ Deploy — Core Server
 * Self-Hosted PaaS by SAYANJALI NEXUS PRIVATE LIMITED
 * Author: Syed Ali Hasan Moosavi <cto@sayanjalinexus.com>
 * GitHub: https://github.com/SHalimoosavi
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');

const { router: appsRouter } = require('./routes/apps');
const authRouter = require('./routes/auth');
const logsRouter = require('./routes/logs');
const deployRouter = require('./routes/deploy');
const { setupSocketHandlers } = require('./socket');
const { initDB } = require('./db');
const { log } = require('./logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SESSION_SECRET || 'syj-deploy-secret-change-me';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Static dashboard
app.use(express.static(path.join(__dirname, '../dashboard/public')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/apps', appsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/deploy', deployRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SYJ Deploy',
    version: '1.0.0-beta',
    by: 'SAYANJALI NEXUS PRIVATE LIMITED',
    uptime: process.uptime()
  });
});

// Catch-all → dashboard
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard/public/index.html'));
});

// Socket.IO
setupSocketHandlers(io);

// Boot
async function boot() {
  await fs.ensureDir(path.join(__dirname, '../apps'));
  await fs.ensureDir(path.join(__dirname, '../logs'));
  await initDB();

  server.listen(PORT, () => {
    log(`\n╔══════════════════════════════════════════╗`);
    log(`║        SYJ Deploy — v1.0.0-beta          ║`);
    log(`║   SAYANJALI NEXUS PRIVATE LIMITED        ║`);
    log(`╠══════════════════════════════════════════╣`);
    log(`║  Dashboard  →  http://localhost:${PORT}      ║`);
    log(`║  API        →  http://localhost:${PORT}/api  ║`);
    log(`╚══════════════════════════════════════════╝\n`);
  });
}

boot().catch(err => {
  console.error('[BOOT ERROR]', err);
  process.exit(1);
});

module.exports = { app, server, io };
