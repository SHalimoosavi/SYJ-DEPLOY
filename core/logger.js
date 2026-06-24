const fs = require('fs-extra');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');

function timestamp() {
  return new Date().toISOString();
}

function log(msg) {
  console.log(msg);
}

async function writeAppLog(appId, line) {
  const logFile = path.join(LOG_DIR, `${appId}.log`);
  await fs.ensureFile(logFile);
  await fs.appendFile(logFile, `[${timestamp()}] ${line}\n`);
}

async function readAppLog(appId, lines = 100) {
  const logFile = path.join(LOG_DIR, `${appId}.log`);
  const exists = await fs.pathExists(logFile);
  if (!exists) return [];
  const content = await fs.readFile(logFile, 'utf-8');
  return content.split('\n').filter(Boolean).slice(-lines);
}

async function clearAppLog(appId) {
  const logFile = path.join(LOG_DIR, `${appId}.log`);
  await fs.writeFile(logFile, '');
}

module.exports = { log, writeAppLog, readAppLog, clearAppLog };
