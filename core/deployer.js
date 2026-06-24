/**
 * SYJ Deploy — Deployer Engine
 * Pulls repo → detects stack → builds → runs → proxies
 */

const path = require('path');
const fs = require('fs-extra');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const simpleGit = require('simple-git');
const detectPort = require('detect-port');

const { getApp, updateApp, addDeployment } = require('./db');
const { writeAppLog } = require('./logger');

const execAsync = promisify(exec);
const APPS_DIR = path.join(__dirname, '../apps');

// Track running processes: { appId: childProcess }
const runningProcesses = {};

// ─── Detect stack ────────────────────────────────────────────────────────────

async function detectStack(appDir) {
  const files = await fs.readdir(appDir);

  if (files.includes('package.json')) {
    const pkg = await fs.readJson(path.join(appDir, 'package.json')).catch(() => ({}));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps['next']) return { type: 'nextjs', build: 'npm run build', start: 'npm start', needsBuild: true };
    if (deps['react-scripts']) return { type: 'react', build: 'npm run build', start: 'npx serve -s build -l $PORT', needsBuild: true };
    if (deps['vite']) return { type: 'vite', build: 'npm run build', start: 'npx serve -s dist -l $PORT', needsBuild: true };
    return { type: 'node', build: null, start: pkg.scripts?.start || 'node index.js', needsBuild: false };
  }

  if (files.includes('requirements.txt') || files.includes('pyproject.toml')) {
    return { type: 'python', build: 'pip install -r requirements.txt', start: 'python app.py', needsBuild: true };
  }

  if (files.includes('index.html')) {
    return { type: 'static', build: null, start: 'npx serve -s . -l $PORT', needsBuild: false };
  }

  return { type: 'unknown', build: null, start: null, needsBuild: false };
}

// ─── Emit logs via socket ─────────────────────────────────────────────────────

let _io = null;
function setIO(io) { _io = io; }

async function emitLog(appId, line) {
  await writeAppLog(appId, line);
  if (_io) _io.to(`app:${appId}`).emit('log', { appId, line, ts: Date.now() });
}

async function emitStatus(appId, status) {
  await updateApp(appId, { status });
  if (_io) _io.emit('appStatus', { appId, status });
}

// ─── Deploy ───────────────────────────────────────────────────────────────────

async function deployApp(appId) {
  const app = await getApp(appId);
  if (!app) throw new Error(`App ${appId} not found`);

  const appDir = path.join(APPS_DIR, app.name);
  await fs.ensureDir(appDir);

  const deployStart = Date.now();

  try {
    // 1. Clone or pull
    await emitStatus(appId, 'building');
    await emitLog(appId, `▶ Starting deployment of ${app.name}`);
    await emitLog(appId, `▶ Repository: ${app.repoUrl}`);
    await emitLog(appId, `▶ Branch: ${app.branch}`);

    const git = simpleGit(appDir);
    const isRepo = await fs.pathExists(path.join(appDir, '.git'));

    if (isRepo) {
      await emitLog(appId, '↓ Pulling latest changes...');
      await git.pull('origin', app.branch);
    } else {
      await emitLog(appId, '↓ Cloning repository...');
      await simpleGit().clone(app.repoUrl, appDir, ['--branch', app.branch, '--single-branch']);
    }

    // Get commit hash
    const log = await simpleGit(appDir).log(['--oneline', '-1']);
    const commitMsg = log.latest ? `${log.latest.hash.slice(0,7)} — ${log.latest.message}` : 'unknown';
    await emitLog(appId, `✓ Commit: ${commitMsg}`);

    // 2. Detect stack
    const detected = await detectStack(appDir);
    const stackType = app.type !== 'auto' ? app.type : detected.type;
    await emitLog(appId, `✓ Stack detected: ${stackType}`);

    // 3. Write .env file
    const envVars = app.envVars || {};
    const port = await detectPort(3100 + Math.floor(Math.random() * 1000));
    envVars.PORT = port;

    const envContent = Object.entries(envVars)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    await fs.writeFile(path.join(appDir, '.env'), envContent);
    await emitLog(appId, `✓ Environment configured (PORT=${port})`);

    // 4. Install dependencies
    if (stackType === 'python') {
      await emitLog(appId, '⚙ Installing Python dependencies...');
      await runCommand('pip install -r requirements.txt', appDir, appId);
    } else if (['node', 'nextjs', 'react', 'vite'].includes(stackType)) {
      await emitLog(appId, '⚙ Installing Node.js dependencies...');
      await runCommand('npm install --legacy-peer-deps', appDir, appId);
    }

    // 5. Build step
    const buildCmd = app.buildCommand || detected.build;
    if (buildCmd && detected.needsBuild) {
      await emitLog(appId, `⚙ Building: ${buildCmd}`);
      await runCommand(buildCmd, appDir, appId, envVars);
    }

    // 6. Stop existing process
    if (runningProcesses[appId]) {
      await emitLog(appId, '⏹ Stopping previous process...');
      killProcess(appId);
    }

    // 7. Start app
    const startCmd = app.startCommand || detected.start || 'npm start';
    await emitLog(appId, `▶ Starting: ${startCmd}`);
    await emitStatus(appId, 'deploying');

    const proc = startProcess(appId, startCmd, appDir, envVars);
    runningProcesses[appId] = proc;

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 8. Update DB
    const duration = ((Date.now() - deployStart) / 1000).toFixed(1);
    await updateApp(appId, {
      status: 'running',
      port,
      deployedAt: new Date().toISOString(),
      deployCount: (app.deployCount || 0) + 1,
      lastCommit: commitMsg,
      stackType
    });

    await addDeployment({
      appId,
      status: 'success',
      commit: commitMsg,
      duration: parseFloat(duration),
      port
    });

    await emitStatus(appId, 'running');
    await emitLog(appId, `\n✅ Deployed successfully in ${duration}s`);
    await emitLog(appId, `🌐 Running on port ${port}`);
    await emitLog(appId, `─────────────────────────────────`);

    if (_io) _io.emit('deployed', { appId, port, name: app.name });

  } catch (err) {
    await emitLog(appId, `\n❌ Deployment failed: ${err.message}`);
    await emitStatus(appId, 'failed');
    await addDeployment({
      appId,
      status: 'failed',
      error: err.message,
      duration: ((Date.now() - deployStart) / 1000).toFixed(1)
    });
    throw err;
  }
}

// ─── Process management ───────────────────────────────────────────────────────

function startProcess(appId, command, cwd, envVars) {
  const env = { ...process.env, ...envVars };
  const [cmd, ...args] = command.split(' ');

  const proc = spawn(cmd, args, {
    cwd,
    env,
    shell: true,
    detached: false
  });

  proc.stdout.on('data', data => {
    writeAppLog(appId, data.toString().trim());
    if (_io) _io.to(`app:${appId}`).emit('log', { appId, line: data.toString().trim() });
  });

  proc.stderr.on('data', data => {
    writeAppLog(appId, `[stderr] ${data.toString().trim()}`);
    if (_io) _io.to(`app:${appId}`).emit('log', { appId, line: `[err] ${data.toString().trim()}` });
  });

  proc.on('exit', async (code) => {
    writeAppLog(appId, `[process exited with code ${code}]`);
    if (runningProcesses[appId]) {
      delete runningProcesses[appId];
      await updateApp(appId, { status: 'stopped', pid: null });
      if (_io) _io.emit('appStatus', { appId, status: 'stopped' });
    }
  });

  updateApp(appId, { pid: proc.pid });
  return proc;
}

function killProcess(appId) {
  const proc = runningProcesses[appId];
  if (proc) {
    try {
      proc.kill('SIGTERM');
      setTimeout(() => {
        try { proc.kill('SIGKILL'); } catch (_) {}
      }, 3000);
    } catch (_) {}
    delete runningProcesses[appId];
  }
}

async function stopApp(appId) {
  killProcess(appId);
  await updateApp(appId, { status: 'stopped', pid: null });
  await writeAppLog(appId, '[stopped by user]');
  if (_io) _io.emit('appStatus', { appId, status: 'stopped' });
}

async function restartApp(appId) {
  await stopApp(appId);
  await new Promise(r => setTimeout(r, 1000));
  await deployApp(appId);
}

// ─── Run shell command (for build steps) ─────────────────────────────────────

function runCommand(cmd, cwd, appId, envVars = {}) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...envVars };
    const proc = spawn(cmd, [], { cwd, env, shell: true });

    proc.stdout.on('data', d => writeAppLog(appId, d.toString().trim()));
    proc.stderr.on('data', d => writeAppLog(appId, d.toString().trim()));

    proc.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`Command "${cmd}" exited with code ${code}`));
    });
  });
}

module.exports = { deployApp, stopApp, restartApp, setIO };
