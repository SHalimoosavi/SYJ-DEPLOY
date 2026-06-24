const express = require('express');
const { getApp, updateApp } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { deployApp, stopApp, restartApp } = require('../deployer');

const router = express.Router();

// POST /api/deploy/:appId — trigger deploy
router.post('/:appId', requireAuth, async (req, res) => {
  try {
    const app = await getApp(req.params.appId);
    if (!app) return res.status(404).json({ error: 'App not found' });

    if (app.status === 'building' || app.status === 'deploying') {
      return res.status(409).json({ error: 'Deployment already in progress' });
    }

    // Respond immediately, deploy in background
    res.json({ success: true, message: 'Deployment started', appId: app.id });

    // Fire off async deploy
    deployApp(app.id).catch(err => {
      console.error(`[DEPLOY ERROR] ${app.name}:`, err.message);
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/deploy/:appId/stop
router.post('/:appId/stop', requireAuth, async (req, res) => {
  try {
    const app = await getApp(req.params.appId);
    if (!app) return res.status(404).json({ error: 'App not found' });

    await stopApp(app.id);
    res.json({ success: true, message: `${app.name} stopped` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/deploy/:appId/restart
router.post('/:appId/restart', requireAuth, async (req, res) => {
  try {
    const app = await getApp(req.params.appId);
    if (!app) return res.status(404).json({ error: 'App not found' });

    res.json({ success: true, message: 'Restart initiated' });
    restartApp(app.id).catch(err => {
      console.error(`[RESTART ERROR] ${app.name}:`, err.message);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
