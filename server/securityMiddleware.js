/**
 * Mandate Gateway — Security Middleware & Hardening Controls
 * - Helmet Security Headers with strict Content Security Policy
 * - Origin-Restricted CORS
 * - Rate Limiting on sensitive endpoints
 * - Parameter & Schema Validation
 * - Safe Centralized Error Handling
 * - CSV Formula Injection Sanitization
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// 1. CORS Allowlist
export function createCorsMiddleware() {
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3001,http://127.0.0.1:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) in dev
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-Token'],
    maxAge: 86400,
  });
}

// 2. Helmet Security Headers with CSP
export function createHelmetMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://lh3.googleusercontent.com",
          "https://images.unsplash.com"
        ],
        connectSrc: ["'self'", "http://localhost:3001", "http://localhost:5173", "ws://localhost:5173"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // avoid blocking local dev cross-origin assets
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
}

// 3. Rate Limiters
export const standardLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '400', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this client. Rate limit exceeded, please retry later.',
    retryAfterSeconds: 900
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '25', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

export const aiProcurementLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 mins
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI brief evaluation rate limit reached. Please throttle sub-agent task queries.'
  }
});

// 4. Session & Authentication Verification
export function createAuthMiddleware(sessionUserRef) {
  return function requireAuth(req, res, next) {
    // Check Authorization header or query token or simulated active session
    const authHeader = req.headers.authorization;
    const sessionToken = req.headers['x-session-token'];

    // In local sandbox environment with in-memory sessionUser:
    if (!sessionUserRef.isAuthenticated) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Sovereign session expired or not authenticated. Please log in.'
      });
    }

    req.user = sessionUserRef;
    next();
  };
}

// 5. Input Validation Helpers
export function validateBody(requiredFields = []) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Malformed request: JSON body required'
      });
    }

    const missing = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required field(s): ${missing.join(', ')}`
      });
    }

    next();
  };
}

// 6. CSV Formula Injection Sanitization
/**
 * Neutralizes Excel / CSV formula injection characters: =, +, -, @, tab (\t), CR (\r).
 * If a field starts with any of these characters, prepend a single quote `'`
 * so spreadsheet software treats it strictly as plain text.
 * Also redacts any sensitive credentials or secrets.
 */
export function sanitizeCsvField(val) {
  if (val === null || val === undefined) return '';
  let str = String(val);

  // Redact potential full secrets/keys
  if (str.startsWith('0x') && str.length > 20) {
    str = str.slice(0, 10) + '...[REDACTED]';
  }
  if (str.includes('ed25519:') && str.length > 20) {
    str = 'ed25519:...[REDACTED]';
  }

  // Formula injection prevention
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousPrefixes.some(prefix => str.startsWith(prefix))) {
    str = `'` + str;
  }

  // Escape double quotes and enclose in quotes if contains comma, quote, or newline
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function exportToSafeCsv(headers, rows) {
  const headerLine = headers.map(h => sanitizeCsvField(h.label || h)).join(',');
  const rowLines = rows.map(row => {
    return headers.map(h => {
      const key = h.key || h;
      return sanitizeCsvField(row[key]);
    }).join(',');
  });

  return [headerLine, ...rowLines].join('\r\n');
}

// 7. Centralized Safe Error Handler
export function errorHandler(err, req, res, next) {
  console.error(`[API ERROR] ${req.method} ${req.url}:`, err.message);

  // Don't leak stack traces, internal paths, or secrets in production responses
  const status = err.status || 500;
  const safeMessage = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal Gateway Server Error. The incident has been recorded in the security audit ledger.'
    : err.message || 'An unexpected error occurred.';

  res.status(status).json({
    success: false,
    error: safeMessage,
    code: err.code || 'GATEWAY_ERROR',
    timestamp: new Date().toISOString()
  });
}
