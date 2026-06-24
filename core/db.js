/**
 * SYJ Deploy — Lightweight JSON Database
 * No external DB required — runs anywhere including Termux
 */

const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../data/db.json');

const DEFAULT_DB = {
  users: [],
  apps: [],
  deployments: []
};

async function initDB() {
  await fs.ensureDir(path.dirname(DB_PATH));
  const exists = await fs.pathExists(DB_PATH);

  if (!exists) {
    // Create default admin user
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      10
    );
    DEFAULT_DB.users.push({
      id: uuidv4(),
      username: process.env.ADMIN_USER || 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    await fs.writeJson(DB_PATH, DEFAULT_DB, { spaces: 2 });
    console.log('[DB] Initialized with default admin user');
  } else {
    console.log('[DB] Loaded existing database');
  }
}

async function readDB() {
  return await fs.readJson(DB_PATH);
}

async function writeDB(data) {
  await fs.writeJson(DB_PATH, data, { spaces: 2 });
}

// Users
async function findUser(username) {
  const db = await readDB();
  return db.users.find(u => u.username === username) || null;
}

// Apps
async function getAllApps() {
  const db = await readDB();
  return db.apps;
}

async function getApp(id) {
  const db = await readDB();
  return db.apps.find(a => a.id === id) || null;
}

async function createApp(appData) {
  const db = await readDB();
  const app = {
    id: uuidv4(),
    ...appData,
    status: 'idle',
    port: null,
    pid: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deployedAt: null,
    deployCount: 0
  };
  db.apps.push(app);
  await writeDB(db);
  return app;
}

async function updateApp(id, updates) {
  const db = await readDB();
  const idx = db.apps.findIndex(a => a.id === id);
  if (idx === -1) return null;
  db.apps[idx] = { ...db.apps[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeDB(db);
  return db.apps[idx];
}

async function deleteApp(id) {
  const db = await readDB();
  db.apps = db.apps.filter(a => a.id !== id);
  await writeDB(db);
}

// Deployments
async function addDeployment(dep) {
  const db = await readDB();
  const deployment = {
    id: uuidv4(),
    ...dep,
    createdAt: new Date().toISOString()
  };
  db.deployments.push(deployment);
  // Keep only last 50 per app
  db.deployments = db.deployments.slice(-200);
  await writeDB(db);
  return deployment;
}

async function getDeployments(appId) {
  const db = await readDB();
  return db.deployments
    .filter(d => d.appId === appId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);
}

module.exports = {
  initDB, readDB, writeDB,
  findUser,
  getAllApps, getApp, createApp, updateApp, deleteApp,
  addDeployment, getDeployments
};
