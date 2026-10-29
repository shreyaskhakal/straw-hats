/**
 * Mandate Gateway — API Contract Definitions & Schema Constants
 * 
 * Centralized specifications for client-server integration boundaries.
 * In Phase 1 (Frontend):
 *  - Client uses Demo Mock Service by default or when backend is absent.
 * In Phase 2 (Backend):
 *  - Express server implements these exact routes and data shapes.
 */

export const API_ENDPOINTS = {
  HEALTH: '/health',
  SESSION: '/session',
  LOGIN: '/login',
  LOGOUT: '/logout',
  DASHBOARD: '/dashboard',
  MANDATES: '/mandates',
  MANDATE_BY_ID: (id) => `/mandates/${id}`,
  MANDATE_REVOKE: (id) => `/mandates/${id}/revoke`,
  AGENT_PARSE_BRIEF: '/agent/parse-brief',
  AGENT_SEARCH: '/agent/search',
  AGENT_EVALUATE: '/agent/evaluate-candidates',
  POLICY_EVALUATE: '/policy/evaluate',
  PURCHASE_REQUESTS: '/requests',
  PURCHASE_REQUEST_BY_ID: (id) => `/requests/${id}`,
  PURCHASE_REQUEST_APPROVE: (id) => `/requests/${id}/approve`,
  PURCHASE_REQUEST_REJECT: (id) => `/requests/${id}/reject`,
  DISPUTE_PACK: (id) => `/requests/${id}/dispute-pack`,
  PAYMENT_METHODS: '/payment-methods',
  PAYMENT_METHOD_FREEZE: (id) => `/payment-methods/${id}/toggle-freeze`,
  PAYMENT_METHOD_LIMITS: (id) => `/payment-methods/${id}/limits`,
  PAYMENTS_ORDERS: '/payments/orders',
  PAYMENTS_BY_ID: (id) => `/payments/${id}`,
  PASSPORTS: '/passports',
  PASSPORTS_REVOKE: (id) => `/passports/${id}/revoke`,
  PASSPORT_VERIFY: (token) => `/passports/verify/${token}`,
  ACTIVITY: '/activity',
  SECURITY_STATUS: '/security/status',
  SECURITY_ATTACKS: '/security/attacks',
  SECURITY_RUN_ATTACKS: '/security/run-attacks',
  SECURITY_KILL_SWITCH: '/security/kill-switch',
  SECURITY_KILL_SWITCH_TOGGLE: '/security/kill-switch/toggle',
  SETTINGS: '/settings'
};

export const API_ROUTES = API_ENDPOINTS;

export const REQUEST_LIFECYCLE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_HITL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  BLOCKED: 'BLOCKED',
  EXPIRED: 'EXPIRED',
  COMPLETED: 'COMPLETED'
};

export const POLICY_VERDICTS = {
  ALLOW: 'ALLOW',
  REQUIRES_APPROVAL: 'REQUIRES_APPROVAL',
  FLAG_HUMAN: 'FLAG_HUMAN',
  BLOCK: 'BLOCK'
};

export const DECISION_REASONS = {
  AUTO_CLEARANCE: 'AUTO_CLEARANCE',
  SINGLE_ITEM_CAP_EXCEEDED: 'SINGLE_ITEM_CAP_EXCEEDED',
  DAILY_OR_MONTHLY_BUDGET_EXCEEDED: 'DAILY_OR_MONTHLY_BUDGET_EXCEEDED',
  UNAPPROVED_MERCHANT: 'UNAPPROVED_MERCHANT',
  PROHIBITED_CATEGORY_OR_KEYWORD: 'PROHIBITED_CATEGORY_OR_KEYWORD',
  MANDATE_EXPIRED_OR_REVOKED: 'MANDATE_EXPIRED_OR_REVOKED',
  KILL_SWITCH_ACTIVE: 'KILL_SWITCH_ACTIVE',
  PROMPT_INJECTION_DETECTED: 'PROMPT_INJECTION_DETECTED'
};
