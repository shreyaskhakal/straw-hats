# Mandate Gateway — Secure AI Purchase Authorization Platform

> **Deterministic Cryptographic Enforcement Engine & Policy Firewall for Autonomous Shopping Agents**  
> Built for the PayPal AI Hackathon • Repository: [https://github.com/shreyaskhakal/straw-hats](https://github.com/shreyaskhakal/straw-hats)

---

## 1. Executive Summary & Problem Space

Autonomous AI shopping agents (Claude, Gemini, Perplexity, GPT-4o) are transitioning from conversational recommenders to autonomous actors capable of making purchases on the open web. However, granting generative AI agents unfettered checkout authority introduces catastrophic security vulnerabilities:
1. **Prompt Injection & Social Engineering**: Attackers trick models into purchasing unauthorized high-value goods, gift cards, or sending funds to malicious merchant domains.
2. **Hallucinated Compliance & Dealbreaker Overrides**: LLMs easily compromise user specifications (e.g. buying a wireless mouse when the user strictly mandated a wired connection).
3. **Runaway Autonomous Spending**: Without atomic budget ceilings and hard programmatic bounds, an autonomous agent can drain accounts in rapid retry loops.
4. **Credential Leakage**: Exposing raw PANs, CVVs, or persistent banking credentials to third-party merchant scraping endpoints creates severe compliance (PCI-DSS) and fraud liability.

### The Mandate Gateway Solution
**Mandate Gateway** establishes a zero-trust, fail-closed policy enforcement proxy between generative shopping agents, merchant storefronts, and PayPal payment rails. 

**Core Security Invariant**: *AI models may recommend candidate purchases, but AI code NEVER decides whether an order is allowed or paid.* Every transaction is deterministically validated by an enclave-modeled Policy Engine, attested with Ed25519 cryptographic signatures, and settled via ephemeral single-use PayPal sandbox tokens.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SOVEREIGN USER TERMINAL                         │
│   (FIDO2 / WebAuthn Authenticated • Single Pane of Control)            │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       MANDATE GATEWAY FRONTEND       │  │     MERCHANT VERIFICATION    │
│  (React 18 + Vite + Stitch Tokens)   │  │   (/verify/:token Public DID)│
└──────────────────┬───────────────────┘  └──────────────┬───────────────┘
                   │ /api (Reverse Proxy)                │
                   ▼                                     │
┌────────────────────────────────────────────────────────┴───────────────┐
│                    MANDATE GATEWAY BACKEND ENGINE                      │
│            (Express.js • Helmet Strict CSP • CORS Origin Allowlist)    │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Security Middleware & Sanitization                                  │
│    - Standard, Auth & AI Procurement Rate Limiters                     │
│    - Anti-Formula-Injection Sanitizer for CSV/Audit Exports           │
│    - Error Cloaking (zero internal stack traces or path leaks)         │
│                                                                        │
│ 2. Deterministic Policy Evaluation Engine (server/policyEngine.js)     │
│    - Emergency Kill-Switch Check (immediate global halt)               │
│    - Active & Unexpired Mandate Verification                           │
│    - Merchant Whitelist / Blocklist Enforcement                        │
│    - Strict Domestic Currency Check (anti-arbitrage USD/INR)           │
│    - Atomic Budget Ceiling & Single-Item Cap Math                      │
│    - Multi-party Co-Signer Threshold Rules                             │
│    - Semantic Quote Verification & Spec Compliance                     │
│    - Output: ALLOW | REQUIRES_APPROVAL | BLOCK | ERROR (Fail Closed)   │
│                                                                        │
│ 3. Settlement & Cryptographic Attestation Modules                      │
│    - Ed25519 Agent Passport Ledger & W3C DID Envelope Minting          │
│    - PayPal Sandbox Rail Connect & Virtual Ephemeral Card Isolation    │
│    - Dispute Pack Generator (Cryptographic Proof-of-Intent)            │
│    - Anti-Replay Token Settlement & 409 Conflict Protection            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL PAYMENT & MERCHANT RAILS                    │
│      - PayPal Sandbox API (/v2/checkout/orders, Captures)              │
│      - Whitelisted Merchant Terminals (Amazon India, Croma, etc.)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS with customized Google Stitch editorial fintech design tokens, Material Symbols Icons, Lucide React.
- **Build Tooling**: Vite 5.4.
- **Backend API**: Node.js (ES Modules), Express 4.
- **Security Middleware**: `helmet` (Strict Content-Security-Policy, `nosniff`, `SAMEORIGIN`), `express-rate-limit` (sliding-window IP/endpoint rate limiting), safe sanitized error handlers.
- **Testing**: Native Node.js ESM test runners (`scripts/test_integration.mjs`, `scripts/test_routes.mjs`).

---

## 4. Security Controls Implemented

| Security Control | Implementation File | Verification & Defense Mechanism |
| :--- | :--- | :--- |
| **Deterministic Policy Engine** | [`server/policyEngine.js`](file:///server/policyEngine.js) | Evaluates 9 mandatory conditions without LLM fuzziness. Defaults to `ERROR` / `BLOCK` (fails closed). |
| **Emergency Global Kill-Switch** | [`server/index.js`](file:///server/index.js), [`server/policyEngine.js`](file:///server/policyEngine.js) | Toggled via `/api/security/kill-switch/toggle`. Immediately halts all autonomous checkout and approvals across all agents. |
| **Duplicate Approval Prevention** | [`server/index.js`](file:///server/index.js) | Anti-replay guard on `/api/requests/:id/approve` returning HTTP `409 Conflict` if an order was already captured. |
| **Formula Injection Defense** | [`server/securityMiddleware.js`](file:///server/securityMiddleware.js) | Escapes CSV fields beginning with `=`, `+`, `-`, `@`, `\t`, `\r` with single-quote prefix `'` to prevent spreadsheet RCE. |
| **Rate Limiting** | [`server/securityMiddleware.js`](file:///server/securityMiddleware.js) | Segmented limiters: Auth (10 req/15m), AI procurement evaluation (30 req/m), standard endpoints (120 req/m). |
| **Content Security Policy (CSP)** | [`server/securityMiddleware.js`](file:///server/securityMiddleware.js) | Helmet CSP enforcing `default-src 'self'`, restricting script/style evaluation, disallowing frame embedding. |
| **CORS Origin Restriction** | [`server/securityMiddleware.js`](file:///server/securityMiddleware.js) | Whitelists only trusted local and production origins; rejects arbitrary cross-origin requests. |
| **Zero Raw Financial Exposure** | [`server/index.js`](file:///server/index.js) | Merchants and AI agents only interact with ephemeral single-use PayPal tokens; raw PAN/CVV credentials never touch browser. |
| **Proof of Intent Dispute Pack** | [`server/index.js`](file:///server/index.js), [`src/components/DisputePackModal.jsx`](file:///src/components/DisputePackModal.jsx) | Compiles tamper-evident quotes, user brief, mandate hash, and enclave signature for instant dispute winning. |
| **Public Merchant Verification** | [`src/pages/MerchantVerifyPage.jsx`](file:///src/pages/MerchantVerifyPage.jsx) | Allows e-commerce stores to verify agent Ed25519 envelopes without bypassing anti-bot defenses or revealing PII. |

---

## 5. Local Setup & Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/shreyaskhakal/straw-hats.git
cd straw-hats

# Copy environment template
cp .env.example .env
```

### Step 2: Install Dependencies
```bash
npm install
```
*(On Windows PowerShell with script restriction policies, use `npm.cmd install`)*

### Step 3: Run the Application

#### Option A: Full Development Mode (Concurrent Vite + Backend)
```bash
# Terminal 1: Backend API
npm run server

# Terminal 2: Frontend Vite Dev Server
npm run dev
```
Open your browser to: **`http://localhost:5173`** (Vite proxies all `/api/*` calls to `http://localhost:3001`).

#### Option B: Production Build & Deployment Mode
```bash
# Build optimized frontend bundle into dist/
npm run build

# Start backend (serves both API and optimized static SPA with fallback)
npm run server
```
Open your browser to: **`http://localhost:3001`**.

---

## 6. Environment Variables Guide

See [`.env.example`](file:///.env.example) for reference:

| Variable | Description | Safe Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port for the backend server | `3001` |
| `NODE_ENV` | Runtime environment (`development` or `production`) | `development` |
| `FRONTEND_ORIGIN` | Trusted frontend origin for CORS allowlisting | `http://localhost:5173` |
| `ALLOWED_ORIGINS` | Comma-delimited list of allowed cross-origin domains | `http://localhost:5173,http://localhost:3001` |
| `SESSION_SECRET` | Cryptographic secret for signing session tokens | `vault-sec-local-development-secret-change-in-prod` |
| `PAYPAL_CLIENT_ID` | PayPal Developer Sandbox App Client ID | Sandbox Mock Key |
| `PAYPAL_CLIENT_SECRET`| PayPal Developer Sandbox App Secret | Sandbox Mock Secret |
| `PAYPAL_ENVIRONMENT` | Payment execution mode (`sandbox` or `live`) | `sandbox` |
| `ENCLAVE_NODE_ID` | Identifier for the secure hardware enclave signing node | `node-us-east-sgx-01` |

---

## 7. Automated Test Suites & Verification

The project includes automated integration and route regression suites:

### Run the End-to-End Integration Suite
```bash
node scripts/test_integration.mjs
```
**Test Coverage (33 Passing Tests)**:
- Frontend HTML shell & `#root` delivery
- Backend health check (`/api/health`) & security headers (Helmet CSP, `X-Content-Type-Options: nosniff`)
- Session retrieval and WebAuthn authentication
- Spending mandate CRUD and cryptographic revocation toggle
- Shopping agent NLP brief parsing & quote evidence verification
- Purchase request creation, deterministic evaluation, and dispute pack generation
- Payment rail connection, limit updating, and card freeze/unfreeze
- Agent passport provisioning, Ed25519 DID verification, and public merchant verification
- Standardized red-team attacks suite (15 vectors executed and defeated)
- Scam message detection & ledger mismatch flags
- **Deterministic Policy Engine direct assertions**:
  - `ALLOW` on compliant order under single-item cap
  - `REQUIRES_APPROVAL` on single-item ceiling breach
  - `BLOCK` on unwhitelisted merchant domain
- **Emergency Kill-Switch lifecycle**: toggle on -> verify pipeline hard-stop `BLOCK` -> toggle off
- **Duplicate approval prevention**: second approval returns HTTP `409 Conflict`
- **CSV export formula injection defense**: checks for sanitization against `=,+,-,@` prefixes

### Run the SPA Client-Side Routing Suite
```bash
node scripts/test_routes.mjs
```
Verifies direct URL resolution (deep linking) across all 14 routes: `/`, `/login`, `/dashboard`, `/mandates`, `/agent`, `/requests`, `/payment-methods`, `/passport`, `/activity`, `/security`, `/settings`, `/verify`, `/verify/:token`, and 404 fallback.

---

## 8. PayPal Sandbox Integration & Capabilities

- **Isolated Sandbox Execution**: All financial operations execute in mock/sandbox isolation with zero risk of live fund movement.
- **Anti-Replay Single-Use Tokens**: Every mock transaction generates an ephemeral order token (e.g. `tok_sandbox_e391a84f09`) and capture ID (e.g. `CAP-58301025`) cryptographically invalidated upon settlement.
- **Proof-of-Intent Dispute Pack**: In the event of seller fraud or non-conforming goods, the gateway compiles an immediate JSON payload formatted for the PayPal Disputes API containing quote evidence and authorized user mandate bounds.

---

## 9. Pages & Features Overview

1. **Dashboard (`/dashboard`)**: Unified control center showing real-time utilization, active mandates, blocked rogue attempts, and kill switch status.
2. **Spending Mandates (`/mandates`)**: Interactive policy compiler that turns plain English intent into deterministic budget ceilings, merchant whitelists, and review sliders.
3. **Shopping Agent (`/agent`)**: Research and procurement agent with verifiable quote extraction, spec-matching chips, and dealbreaker enforcement.
4. **Purchase Requests (`/requests`)**: Real-time review queue featuring dynamic approval, duplicate prevention, and one-click dispute pack inspection.
5. **Agent Passport (`/passport`)**: Cryptographic identity minting, W3C DID ledger, Ed25519 credential management, and quick links to public merchant verification.
6. **Payment Methods (`/payment-methods`)**: Connect sandbox rails, set auto-approval caps, and instantly freeze compromised virtual cards.
7. **Security Center (`/security`)**: Live kill-switch, interactive Red-Team runner (15 attack vectors), scam sandbox, and active session controls.
8. **Activity Log (`/activity`)**: Immutable audit trail with instant JSON export and Formula-Injection-Safe CSV downloads.
9. **Merchant Verify (`/verify/:token`)**: Public attestation portal allowing e-commerce vendors to verify agent authenticity without accessing private financial data.

---

## 10. Threat Model & Security Assumptions

- **Untrusted Generative Layer**: AI models (prompts, completions, tool calls) are treated as untrusted and potentially adversarial input.
- **Zero Invariant Overrides**: Natural language instructions from AI cannot expand or bypass user-defined limits.
- **Fail-Closed Principle**: Any runtime exception, missing data, or ambiguous mandate status immediately defaults to `BLOCK` or `ERROR`.
- **Ephemeral Credentials**: Tokens expire after single use; virtual cards have hard budget caps enforced at the gateway layer.
