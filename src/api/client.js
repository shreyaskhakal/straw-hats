const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
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

  // Requests
  getRequests: () => request('/requests'),
  approveRequest: (id) => request(`/requests/${id}/approve`, { method: 'POST' }),
  rejectRequest: (id) => request(`/requests/${id}/reject`, { method: 'POST' }),
  getDisputePack: (id) => request(`/requests/${id}/dispute-pack`),

  // Payment Methods
  getPaymentMethods: () => request('/payment-methods'),
  toggleFreezePaymentMethod: (id) => request(`/payment-methods/${id}/toggle-freeze`, { method: 'POST' }),

  // Passports
  getPassports: () => request('/passports'),
  revokePassport: (id) => request(`/passports/${id}/revoke`, { method: 'POST' }),
  verifyMerchantToken: (token) => request(`/passports/verify/${token}`),

  // Activity / Audit
  getActivity: () => request('/activity'),

  // Security
  getAttacks: () => request('/security/attacks'),
  runAttacks: () => request('/security/run-attacks', { method: 'POST' }),
  checkScamMessage: (message) => request('/security/check-message', {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),

  // Settings
  getSettings: () => request('/settings'),
  saveSettings: (settings) => request('/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  }),
};
