import { dispatchMockRequest } from './mockService.js';

const RAW_BASE = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = RAW_BASE ? RAW_BASE.replace(/\/+$/, '') : '/api';
const FORCE_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

let isDemoSandboxActive = FORCE_DEMO;

export function isDemoMode() {
  return isDemoSandboxActive;
}

export function getApiBaseUrl() {
  return BASE_URL;
}

async function request(endpoint, options = {}) {
  // If explicitly requested via VITE_DEMO_MODE or running in frontend-only mock mode
  if (FORCE_DEMO) {
    isDemoSandboxActive = true;
    return await dispatchMockRequest(endpoint, options);
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    const contentType = res.headers.get('content-type') || '';
    const isHtmlResponse = contentType.includes('text/html');

    // If API returned 404/502/503/504 on relative proxy or SPA HTML fallback, fallback to mock service
    if (((res.status === 404 || res.status === 502 || res.status === 503 || res.status === 504) || isHtmlResponse) && !RAW_BASE) {
      console.info(`[Mandate Gateway] Backend route ${endpoint} not available (status: ${res.status}, isHtml: ${isHtmlResponse}). Serving via demo mock layer.`);
      isDemoSandboxActive = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mandate-gateway-demo-active', { detail: { endpoint } }));
      }
      return await dispatchMockRequest(endpoint, options);
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error = new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.data = errData;
      throw error;
    }

    return await res.json();
  } catch (err) {
    // If backend connection was refused, failed network fetch, or parsed HTML as JSON from SPA rewrites
    const isNetworkOrParseIssue =
      err.name === 'TypeError' ||
      err.name === 'SyntaxError' ||
      err.message?.includes('fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('Unexpected token') ||
      err.message?.includes('is not valid JSON') ||
      err.message?.includes('ERR_CONNECTION_REFUSED');

    if (isNetworkOrParseIssue && !RAW_BASE) {
      console.info(`[Mandate Gateway] Live backend unreachable for ${endpoint}. Serving via client-side demo sandbox.`);
      isDemoSandboxActive = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mandate-gateway-demo-active', { detail: { endpoint } }));
      }
      return await dispatchMockRequest(endpoint, options);
    }

    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Session
  getSession: () => request('/session'),
  login: (passphrase, rememberTerminal) => request('/login', {
    method: 'POST',
    body: JSON.stringify({ passphrase, rememberTerminal }),
  }),
  logout: () => request('/logout', { method: 'POST' }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Mandates
  getMandates: () => request('/mandates'),
  createMandate: (data) => request('/mandates', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  revokeMandate: (id) => request(`/mandates/${id}/revoke`, { method: 'POST' }),

  // Shopping Agent
  parseBrief: (prompt) => request('/agent/parse-brief', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  }),
  evaluateCandidates: (brief) => request('/agent/evaluate-candidates', {
    method: 'POST',
    body: JSON.stringify({ brief }),
  }),

  // Deterministic Policy Evaluation
  evaluatePolicy: (data) => request('/policy/evaluate', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Requests
  getRequests: () => request('/requests'),
  createRequest: (data) => request('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  approveRequest: (id) => request(`/requests/${id}/approve`, { method: 'POST' }),
  rejectRequest: (id) => request(`/requests/${id}/reject`, { method: 'POST' }),
  getDisputePack: (id) => request(`/requests/${id}/dispute-pack`),

  // Payment Methods
  getPaymentMethods: () => request('/payment-methods'),
  toggleFreezePaymentMethod: (id) => request(`/payment-methods/${id}/toggle-freeze`, { method: 'POST' }),
  connectPaymentRail: (data) => request('/payment-methods/connect', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePaymentLimits: (id, data) => request(`/payment-methods/${id}/limits`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Passports
  getPassports: () => request('/passports'),
  createPassport: (data) => request('/passports', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  revokePassport: (id) => request(`/passports/${id}/revoke`, { method: 'POST' }),
  verifyMerchantToken: (token) => request(`/passports/verify/${token}`),

  // Activity / Audit
  getActivity: () => request('/activity'),

  // Security & Resilience
  getAttacks: () => request('/security/attacks'),
  runAttacks: () => request('/security/run-attacks', { method: 'POST' }),
  checkScamMessage: (message) => request('/security/check-message', {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),
  getKillSwitch: () => request('/security/kill-switch'),
  toggleKillSwitch: (reason) => request('/security/kill-switch/toggle', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),

  // Settings
  getSettings: () => request('/settings'),
  saveSettings: (settings) => request('/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  }),
};
