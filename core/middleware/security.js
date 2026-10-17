const crypto = require('node:crypto');
const { cfg } = require('../config');

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

function createCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = createCsrfToken();
  }
  return req.session.csrfToken;
}

function timingSafeEqualToken(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = crypto.createHash('sha256').update(a).digest();
  const right = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

function csrf(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  // GitHub webhooks authenticate with their own HMAC signature.
  if (req.path.startsWith('/api/deploy/webhooks/github/')) {
    return next();
  }

  const token = req.get('x-csrf-token');
  const sessionToken = req.session.csrfToken;

  if (!token || !sessionToken || !timingSafeEqualToken(token, sessionToken)) {
    return res.status(403).json({ error: 'CSRF token required' });
  }

  next();
}

function corsOrigin(req, res, next) {
  if (!cfg.allowedOrigins.length) {
    return next();
  }

  const origin = req.get('origin');

  if (!origin) {
    return next();
  }

  if (cfg.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  }

  return res.status(403).json({ error: 'Origin not allowed' });
}

function rateLimit() {
  const map = new Map();

  return (req, res, next) => {
    if (req.path !== '/login') {
      return next();
    }

    const key = `${req.ip}:${String(req.body?.username || '').toLowerCase()}`;
    const now = Date.now();
    const item = map.get(key) || { failures: 0, until: 0 };

    if (item.until > now) {
      return res.status(429).json({
        error: 'Too many login attempts',
        retryAfter: Math.ceil((item.until - now) / 1000)
      });
    }

    req.loginRate = {
      fail() {
        item.failures += 1;
        item.until = now + Math.min(900000, Math.pow(2, item.failures) * 1000);
        map.set(key, item);
      },
      ok() {
        map.delete(key);
      }
    };

    next();
  };
}

module.exports = {
  securityHeaders,
  csrf,
  corsOrigin,
  rateLimit,
  createCsrfToken,
  ensureCsrfToken,
  timingSafeEqualToken
};
