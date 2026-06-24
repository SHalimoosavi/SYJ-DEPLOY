const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { readAppLog, clearAppLog } = require('../logger');
const { getApp } = require('../db');

const router = express.Router();

// GET /api/logs/:appId
router.get('/:appId', requireAuth, async (req, res) => {
  try {
    const app = await getApp(req.params.appId);
    if (!app) return res.status(404).json({ error: 'App not found' });

    const lines = parseInt(req.query.lines) || 100;
    const logs = await readAppLog(req.params.appId, lines);
    res.json({ logs, appId: req.params.appId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/logs/:appId
router.delete('/:appId', requireAuth, async (req, res) => {
  try {
    await clearAppLog(req.params.appId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
