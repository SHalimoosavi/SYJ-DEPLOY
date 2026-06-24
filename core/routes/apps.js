const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { getAllApps, getApp, createApp, updateApp, deleteApp, getDeployments } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { stopApp } = require('../deployer');

const router = express.Router();

// GET /api/apps
router.get('/', requireAuth, async (req, res) => {
  try {
    const apps = await getAllApps();
    res.json({ apps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/apps/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const app = await getApp(req.params.id);
    if (!app) return res.status(404).json({ error: 'App not found' });
    res.json({ app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/apps — create new app
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, repoUrl, branch, buildCommand, startCommand, envVars, type } = req.body;

    if (!name || !repoUrl) {
      return res.status(400).json({ error: 'name and repoUrl are required' });
    }

    // Validate name
    if (!/^[a-z0-9-]+$/.test(name)) {
      return res.status(400).json({ error: 'Name must be lowercase letters, numbers, and hyphens only' });
    }

    // Check unique name
    const apps = await getAllApps();
    if (apps.find(a => a.name === name)) {
      return res.status(409).json({ error: `App name "${name}" is already taken` });
    }

    const app = await createApp({
      name,
      repoUrl,
      branch: branch || 'main',
      buildCommand: buildCommand || '',
      startCommand: startCommand || 'npm start',
      envVars: envVars || {},
      type: type || 'node',
      ownerId: req.session.userId
    });

    res.status(201).json({ app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/apps/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const app = await getApp(req.params.id);
    if (!app) return res.status(404).json({ error: 'App not found' });

    const allowed = ['branch', 'buildCommand', 'startCommand', 'envVars'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await updateApp(req.params.id, updates);
    res.json({ app: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/apps/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const app = await getApp(req.params.id);
    if (!app) return res.status(404).json({ error: 'App not found' });

    // Stop if running
    if (app.status === 'running') {
      await stopApp(app.id);
    }

    // Remove app directory
    const appDir = path.join(__dirname, '../../apps', app.name);
    await fs.remove(appDir);

    await deleteApp(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/apps/:id/deployments
router.get('/:id/deployments', requireAuth, async (req, res) => {
  try {
    const deployments = await getDeployments(req.params.id);
    res.json({ deployments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router };
