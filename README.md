# Mandate Gateway — User-Controlled Authorization Layer for AI Shopping Agents

> **Deterministic Policy Firewall, Spend Governance & PayPal Sandbox Payment Orchestration for Autonomous E-Commerce Agents**  
> Built for the PayPal AI Hackathon • Repository: [https://github.com/shreyaskhakal/straw-hats](https://github.com/shreyaskhakal/straw-hats)

---

## 1. Executive Summary & Problem Space

Autonomous AI shopping agents (powered by Claude, Gemini, GPT-4o, and Perplexity) are rapidly transitioning from informational research assistants into autonomous checkout actors. However, handing generative AI models direct payment credentials or unfettered checkout capability creates critical risks:

1. **Prompt Injection & Limit Evasion**: Adversarial web pages or prompt injections can trick shopping models into overriding spending limits, buying luxury items, purchasing untrusted gift cards, or sending funds to rogue merchants.
2. **Hallucinated Compliance & Dealbreaker Overrides**: LLMs easily compromise user specifications (e.g. buying a battery-powered device when the user strictly mandated a rechargeable USB-C model).
3. **Runaway Autonomous Spending**: Without atomic budget ceilings and hard deterministic bounds, an autonomous agent can drain cards in rapid automated loops.
4. **Credential Leakage**: Exposing raw card numbers, CVVs, or persistent banking credentials to third-party merchant scraping endpoints creates severe PCI-DSS liability and fraud exposure.

### The Mandate Gateway Solution
**Mandate Gateway** establishes a zero-trust, fail-closed policy enforcement proxy between generative shopping agents, product providers, merchant storefronts, and PayPal payment rails.

**Core Invariant**: *AI models may search, compare, and recommend purchases, but generative code NEVER decides whether an order is allowed or paid.* Every purchase request is deterministically validated by a Policy Engine against user-defined spending mandates, audited, and processed via PayPal Sandbox payment intents with zero raw card exposure.

---

## 2. System Architecture & Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SOVEREIGN USER DASHBOARD                        │
│             (Single Pane of Control • Dark/Light Stitch UI)            │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       MANDATE GATEWAY FRONTEND       │  │     MERCHANT VERIFICATION    │
│  (React 18 + Vite + Stitch Tokens)   │  │   (/verify/:token Public DID)│
└──────────────────┬───────────────────┘  └──────────────┬───────────────┘
                   │                                     │
                   ▼                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DETERMINISTIC AUTHORIZATION ENGINE                   │
│         (Fail-Closed Invariant Checks • Human-in-the-Loop)             │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Global Kill-Switch Check (immediate halt if engaged)                │
│ 2. Active Mandate & Expiration Verification                            │
│ 3. Category & Merchant Whitelist/Blacklist Matching                    │
│ 4. Single-Item Price Ceiling & Remaining Cumulative Budget             │
│ 5. Human-in-the-Loop Trigger (flagged if > auto-clear limit)           │
│ 6. Output Verdict: ALLOW (Auto-Clear) | FLAG_HUMAN | BLOCK             │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       CHANNEL3 PRODUCT ADAPTER       │  │    PAYPAL SANDBOX SERVICE    │
│  (Modular Provider / Demo Catalog)   │  │ (7-State Payment Orchestrator│
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### 5-Step Mandate-to-Purchase Flow
1. **User Sets Mandate**: Define strict constraints (e.g., "Home Office", INR 50,000 budget, max INR 5,000/item, Amazon India & Croma whitelisted, electronics only).
2. **AI Agent Finds Products**: The agent searches via the modular product provider (Channel3 adapter) and submits purchase candidates.
3. **Deterministic Policy Check**: The policy engine evaluates rules with zero LLM hallucinations. Compliant items under threshold auto-clear; sensitive items trigger human review.
4. **Human Review (HITL)**: Purchases exceeding auto-clear thresholds require explicit sovereign confirmation before order creation.
5. **PayPal Sandbox Settlement**: The payment service initiates and captures PayPal sandbox orders with anti-replay guarantees and zero raw financial credential leakage.

---

## 3. Frontend-First Architecture & Vercel Readiness

Mandate Gateway is built with a **Frontend-First delivery model**:
- **Self-Contained Client Demo Mode**: The application includes a rich client-side mock service (`src/api/mockService.js` and `src/api/mockData.js`) that simulates the full backend gateway lifecycle, enabling seamless evaluation on Vercel with zero external server dependencies.
- **Unified Clean Integration Boundary**: All API routes and contracts are centralized in `src/services/apiContract.js` (`API_ROUTES`, `REQUEST_LIFECYCLE_STATUS`, `POLICY_VERDICTS`, `DECISION_REASONS`).
- **OpenAPI 3.0.3 Contract (`openapi.yaml`)**: Standardized specification covering all endpoints, parameters, request bodies, and responses for future Express backend deployment.
- **Postman Collection v2.1.0 (`postman_collection.json`)**: Pre-configured collection with all 12 modules, realistic mock payloads, and environment variables.
- **Vercel SPA Routing (`vercel.json`)**: Configured with single-page application URL rewrites to `/index.html` ensuring direct deep-linking on all routes.

---

## 4. Sponsor Tool Integrations & Design Decisions

### A. Channel3 Integration (Product Discovery & Checkout Adapter)
- **Architecture**: Implemented a decoupled `ProductProvider` base class and `DemoChannel3ProductProvider` in [`src/services/productProvider.js`](file:///src/services/productProvider.js).
- **Functionality**:
  - Structured search with category, subcategory, must-haves, and price bounds.
  - Realistic merchant product catalog (Amazon India, Croma, Reliance Digital, Tata CLiQ).
  - Verifiable product specs and quote evidence digests.
  - Side-by-side candidate comparison matrix.
  - Clean drop-in boundary: swapping demo data for the live Channel3 API requires only filling API keys in `Channel3ProductProvider`.

### B. Postman Integration (API Governance & Testing)
- **Artifact**: [`postman_collection.json`](file:///postman_collection.json).
- **Structure**: 12 organized folders matching the complete gateway lifecycle:
  1. Health & System (`GET /health`)
  2. Session & Auth (`GET /session`, `POST /login`, `POST /logout`)
  3. Dashboard State (`GET /dashboard`)
  4. Mandates (`GET /mandates`, `POST /mandates`, `POST /mandates/:id/revoke`)
  5. Shopping Agent (`POST /agent/parse-brief`, `POST /agent/evaluate-candidates`)
  6. Deterministic Policy (`POST /policy/evaluate`)
  7. Purchase Requests (`GET /requests`, `POST /requests`, `POST /requests/:id/approve`, `POST /requests/:id/reject`, `GET /requests/:id/dispute-pack`)
  8. Payment Rails & PayPal Sandbox (`GET /payment-methods`, `POST /payment-methods/connect`, `POST /payment-methods/:id/toggle-freeze`, `POST /payment-methods/:id/limits`)
  9. Agent Passports & Merchant Verification (`GET /passports`, `POST /passports`, `POST /passports/:id/revoke`, `GET /passports/verify/:token`)
  10. Activity & Audit Logs (`GET /activity`, `GET /activity/export`)
  11. Security & Resilience (`GET /security/attacks`, `POST /security/run-attacks`, `POST /security/check-message`, `GET /security/kill-switch`, `POST /security/kill-switch/toggle`)
  12. Settings (`GET /settings`, `POST /settings`)

### C. APIMatic Integration (SDK & API Documentation)
- **Artifact**: [`openapi.yaml`](file:///openapi.yaml).
- **Readiness**: Formatted in standard OpenAPI 3.0.3, strictly compliant with APIMatic validation rules, enabling one-click generation of client SDKs (TypeScript, Python, Java, C#) and interactive API documentation portals.

### D. AG Grid Evaluation & Dense Table Design Decision
- **Evaluation**: Evaluated AG Grid for tabular data displays (Activity Log, Purchase Requests, Payment Rails).
- **Decision**: To optimize for rapid page loads, zero commercial license dependencies, and strict aesthetic consistency with Google Stitch editorial fintech design tokens, we engineered bespoke high-density table components featuring:
  - Multi-column sorting (timestamp, amount, status).
  - Multi-facet filtering (type, status, date).
  - Search across IDs, titles, merchants, and agents.
  - Responsive pagination and formula-injection-safe CSV export.
  - Lightweight DOM footprint with zero vendor bundle bloat.

---

## 5. PayPal Sandbox Integration & Payment Lifecycle

Mandate Gateway orchestrates payments through an explicit 7-stage lifecycle implemented in [`src/services/paymentService.js`](file:///src/services/paymentService.js):

| State | Description | Transition Trigger |
| :--- | :--- | :--- |
| `NOT_CONFIGURED` | Gateway has no active PayPal credentials linked. | Operator connects sandbox client ID. |
| `SANDBOX_CONFIGURED` | Linked to `api-m.sandbox.paypal.com` with zero raw credentials stored. | Ready for purchase authorizations. |
| `CREATING_ORDER` | Policy engine has approved order; initiating PayPal sandbox intent. | POST `/v2/checkout/orders` call. |
| `AWAITING_APPROVAL` | High-value purchase flagged for human-in-the-loop sovereign review. | Human clicks "Approve Purchase". |
| `PAYMENT_PENDING` | Order created; awaiting simulated capture or buyer checkout token. | Automated sandbox capture. |
| `COMPLETED` | Simulated order captured; anti-replay capture ID minted. | Transaction finalized; logged to audit. |
| `FAILED_OR_CANCELLED` | Order failed policy checks, was rejected by human, or timed out. | Final terminal failure state. |

> **Sandbox Intent Disclosure**: PayPal is the intended payment integration rail. All financial transactions displayed in the demo execute in isolated simulated sandbox mode against mock PayPal endpoints (`api-m.sandbox.paypal.com`). No live financial settlements or card charges occur.

---

## 6. Judge Demo Walkthrough: 6 Deterministic Scenarios

In the **Shopping Agent (`/agent`)** page, judges can click 6 pre-configured scenario buttons to test the deterministic policy engine:

1. **Auto-Clear (Compliant Mouse — INR 2,499)**:
   - *Input*: Portronics Toad One Wireless Mouse on Amazon India (Whitelisted).
   - *Verdict*: **`ALLOW` (Auto-Cleared)**.
   - *Rationale*: Price is below the INR 5,000 single-item limit and merchant is whitelisted.
2. **Flagged for Human Review (Dell 4K Monitor — INR 42,500)**:
   - *Input*: Dell UltraSharp 27 4K Monitor on Amazon India (Whitelisted).
   - *Verdict*: **`FLAG_HUMAN` (Requires Sovereign Approval)**.
   - *Rationale*: Price exceeds the INR 5,000 auto-clear threshold but remains within the INR 50,000 total budget.
3. **Blocked: Over-Budget (Apple Studio Display — INR 159,900)**:
   - *Input*: Apple Studio Display Nano-Texture on Croma.
   - *Verdict*: **`BLOCK` (Budget Exceeded)**.
   - *Rationale*: Exceeds both the single-item limit and the mandate's total remaining budget.
4. **Blocked: Blacklisted Merchant (Rogue Cables — INR 1,200)**:
   - *Input*: High-Speed HDMI 2.1 Cable on AliExpress.
   - *Verdict*: **`BLOCK` (Merchant Untrusted)**.
   - *Rationale*: AliExpress is blacklisted under the active mandate; zero funds allowed.
5. **Blocked: Disallowed Category (Gold Coin — INR 8,500)**:
   - *Input*: 1g 24K Gold Coin on Amazon India.
   - *Verdict*: **`BLOCK` (Category Violation)**.
   - *Rationale*: Jewelry and bullion are excluded; only office electronics are permitted.
6. **Blocked: Dealbreaker Mismatch (Battery Mouse — INR 1,899)**:
   - *Input*: Disposable AA-battery mouse when user specified rechargeable USB-C.
   - *Verdict*: **`BLOCK` (Spec Compliance Failure)**.
   - *Rationale*: Missing required user specification; fail-closed enforcement prevents purchase.

---

## 7. Security Architecture & Attestation Truthfulness

| Security Layer | Implementation File | Verification & Truthful Disclosure |
| :--- | :--- | :--- |
| **Deterministic Invariants** | [`src/services/apiContract.js`](file:///src/services/apiContract.js) | Evaluates constraints in pure code with zero probabilistic LLM drift. Defaults to `BLOCK`. |
| **Emergency Global Kill-Switch** | [`src/pages/SecurityPage.jsx`](file:///src/pages/SecurityPage.jsx) | Toggles immediate global halt of all autonomous orders and approvals across all agents. |
| **Anti-Replay Approvals** | [`src/pages/PurchaseRequestsPage.jsx`](file:///src/pages/PurchaseRequestsPage.jsx) | Single-use approval tokens prevent duplicate order captures. |
| **Agent Passport Attestation** | [`src/pages/AgentPassportPage.jsx`](file:///src/pages/AgentPassportPage.jsx) | **Truthful Disclosure**: Agent Passports use simulated software SHA-256 digests and mock DID envelopes for demo purposes (not hardware Intel SGX/AWS Nitro enclaves). |
| **Zero Raw Financial Exposure** | [`src/pages/PaymentMethodsPage.jsx`](file:///src/pages/PaymentMethodsPage.jsx) | Raw credit card numbers and CVVs are never collected or stored. Ephemeral sandbox tokens are used exclusively. |
| **Audit Pack & Dispute Proof** | [`src/components/DisputePackModal.jsx`](file:///src/components/DisputePackModal.jsx) | Assembles product specs, user brief snapshot, and policy decisions into a dispute-ready payload. |
| **Red-Team Attack Suite** | [`src/pages/SecurityPage.jsx`](file:///src/pages/SecurityPage.jsx) | Tests prompt injection, budget draining, and limit evasion vectors with real-time defense metrics. |

---

## 8. Local Setup & Verification

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
git clone https://github.com/shreyaskhakal/straw-hats.git
cd straw-hats

# Install dependencies
npm install
```
*(On Windows systems where PowerShell execution policies restrict scripts, execute via `cmd /c npm install`)*

### Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** to access the interactive Mandate Gateway.

### Automated Test Suite
```bash
npm run test
```
The automated verification suite (`scripts/test_frontend.mjs`) validates:
- Production build artifacts (`dist/index.html`, vendor bundles, stylesheets, static assets).
- Vercel configuration (`vercel.json` SPA rewrites and output directories).
- Client mock service layer (`/health`, `/dashboard`, `/mandates`, `/agent`, `/policy/evaluate`, `/requests`, `/payment-methods`, `/passports`, `/security/attacks`).
- Direct URL deep linking across all 14 routes.

### Production Build
```bash
npm run build
```
Generates the optimized production build in `dist/`.

---

## 9. Vercel Deployment Instructions

1. **Connect GitHub Repository**: Import `https://github.com/shreyaskhakal/straw-hats` in the Vercel dashboard.
2. **Build Configuration**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. **Environment Variables**:
   - `VITE_APP_MODE=demo` (enables frontend demo mode)
   - `VITE_PAYPAL_SANDBOX_CLIENT_ID=mock_client_id_sandbox`
4. **Deploy**: Click Deploy. Vercel automatically respects [`vercel.json`](file:///vercel.json) rewrites, routing all subpaths to `/index.html` for client-side navigation.

---

## 10. Design Aesthetics & Dark/Light Mode

Mandate Gateway implements an editorial fintech aesthetic inspired by Google Stitch:
- **Design Tokens**: Defined in [`src/index.css`](file:///src/index.css) using HSL variables for both light and dark mode.
- **Light Mode ("Light Sovereign")**: Warm off-white canvas (`#F5F5F3`), crisp elevated cards (`#FFFFFF`), high-contrast obsidian typography (`#242424`), and subtle beige borders (`#E7E7E3`).
- **Dark Mode ("Obsidian Dark")**: Deep obsidian canvas (`#141414`), graphite cards (`#1D1D1D`), soft off-white text (`#F5F5F5`), and dark slate borders (`#353535`).
- **Theme Toggle**: Accessible in the header bar and dynamically configurable in [`src/pages/SettingsPage.jsx`](file:///src/pages/SettingsPage.jsx) with instant persistence to `localStorage`.

---

## 11. Repository Structure

```
straw-hats/
├── openapi.yaml                 # OpenAPI 3.0.3 specification for APIMatic & backend
├── postman_collection.json      # Postman Collection v2.1.0 with 12 modules
├── vercel.json                  # Vercel deployment & SPA rewrite routing
├── vite.config.js               # Vite 5 bundler configuration
├── tailwind.config.js           # Tailwind CSS configuration with Stitch tokens
├── index.html                   # HTML5 entrypoint with Google Fonts & metadata
├── scripts/
│   └── test_frontend.mjs        # Automated verification suite (build, routes, mocks)
└── src/
    ├── main.jsx                 # React root mounting with ThemeProvider
    ├── App.jsx                  # React Router configuration & route declarations
    ├── index.css                # Sovereign light & dark theme design tokens
    ├── api/
    │   ├── mockData.js          # Seed dataset covering all 7 lifecycle statuses
    │   └── mockService.js       # Client mock dispatcher simulating gateway backend
    ├── context/
    │   └── ThemeContext.jsx     # Theme context provider (light / dark mode)
    ├── services/
    │   ├── apiContract.js       # Centralized route constants & status enums
    │   ├── paymentService.js    # PayPal Sandbox 7-stage payment service
    │   └── productProvider.js   # Channel3 modular product search adapter
    ├── components/
    │   ├── Header.jsx           # Global header with theme toggle & live status
    │   ├── Sidebar.jsx          # Sovereign navigation sidebar
    │   ├── ConfirmationModal.jsx# Sovereign approval/rejection modal
    │   └── DisputePackModal.jsx # Proof-of-Intent audit pack generator
    └── pages/
        ├── LandingPage.jsx      # High-conversion product overview & flow diagram
        ├── DashboardPage.jsx    # Real-time metrics, active mandates & approvals
        ├── MandatesPage.jsx     # 4-step interactive spending mandate wizard
        ├── ShoppingAgentPage.jsx# Channel3 product search & 6 judge scenario tests
        ├── PurchaseRequestsPage.jsx # 7-status request queue with action modal
        ├── PaymentMethodsPage.jsx # PayPal Sandbox rails & limit management
        ├── AgentPassportPage.jsx# Agent credential ledger & verification links
        ├── ActivityPage.jsx     # Searchable, filterable audit log with CSV export
        ├── SecurityPage.jsx     # Kill-switch, attack suite & scam detection
        ├── SettingsPage.jsx     # Theme, currency & notification preferences
        └── MerchantVerifyPage.jsx # Public merchant token attestation portal
```

---

## 12. License & Disclaimers

- **License**: MIT License.
- **PayPal Hackathon Project**: Built for the PayPal AI Hackathon.
- **Payment Settlement**: PayPal is the intended payment integration. All transactions in this frontend release are executed in simulated sandbox mode. No live funds are moved.
- **Attestation Model**: Hardware enclave (SGX/Nitro) and blockchain anchoring are represented via software SHA-256 digests and simulated DID tokens for hackathon evaluation.
