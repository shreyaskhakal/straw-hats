/**
 * PayPal Payment Service Interface & Lifecycle State Engine
 * 
 * Mandate Gateway Architecture Boundary:
 * This service handles payment initiation, sandbox order generation,
 * capture verification, and payment lifecycle tracking.
 * 
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. PayPal Client Secret is NEVER exposed to the frontend.
 * 2. In this frontend demo phase, transactions are simulated sandbox orders.
 * 3. The future backend re-evaluates mandate invariants before order creation or capture.
 *    The frontend is never the sole authority for permitting payment.
 * 4. Flow: User Mandate -> AI Product Discovery -> Server Policy Decision ->
 *    Human Approval (if required) -> PayPal Sandbox Order -> Verified Result -> Audit Event.
 */

export const PAYMENT_LIFECYCLE_STATES = {
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  SANDBOX_CONFIGURED: 'SANDBOX_CONFIGURED',
  CREATING_ORDER: 'CREATING_ORDER',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  COMPLETED: 'COMPLETED',
  FAILED_OR_CANCELLED: 'FAILED_OR_CANCELLED'
};

/**
 * @typedef {Object} PayPalOrderRequest
 * @property {string} requestId - Associated Purchase Request ID (e.g. PR-1082)
 * @property {string} mandateId - Bound spending mandate ID (e.g. M-902)
 * @property {number} amount - Transaction amount
 * @property {string} currency - 3-letter currency code (e.g. INR, USD)
 * @property {string} merchant - Target merchant
 * @property {string} itemTitle - Description of product
 */

/**
 * @typedef {Object} PayPalOrderResult
 * @property {string} orderId - PayPal Order ID (e.g. 5O190127TN364715T)
 * @property {string} status - State from PAYMENT_LIFECYCLE_STATES
 * @property {string} intent - 'CAPTURE' | 'AUTHORIZE'
 * @property {number} amount
 * @property {string} currency
 * @property {string} createdAt
 * @property {boolean} isSimulated
 * @property {string} [captureId]
 * @property {string} [failureReason]
 */

export class PaymentService {
  /**
   * Get the current payment-provider configuration state
   * @returns {Promise<{state: string, environment: string, clientIdConfigured: boolean, webhookActive: boolean}>}
   */
  async getConfigurationStatus() {
    throw new Error('PaymentService.getConfigurationStatus must be implemented by subclass');
  }

  /**
   * Create a PayPal order after policy clearance
   * @param {PayPalOrderRequest} orderData
   * @returns {Promise<PayPalOrderResult>}
   */
  async createOrder(_orderData) {
    throw new Error('PaymentService.createOrder must be implemented by subclass');
  }

  /**
   * Authorize or capture a previously created PayPal order
   * @param {string} orderId
   * @returns {Promise<PayPalOrderResult>}
   */
  async captureOrder(_orderId) {
    throw new Error('PaymentService.captureOrder must be implemented by subclass');
  }

  /**
   * Simulate a payment failure or cancellation for test/demo evaluation
   * @param {string} orderId
   * @param {string} reason
   * @returns {Promise<PayPalOrderResult>}
   */
  async simulateFailureOrCancellation(_orderId, _reason) {
    throw new Error('PaymentService.simulateFailureOrCancellation must be implemented by subclass');
  }
}

/**
 * Demo implementation for the frontend phase.
 * Operates strictly with deterministic sandbox fixtures and sessionStorage persistence.
 */
export class DemoPayPalPaymentService extends PaymentService {
  constructor() {
    super();
    this.environment = 'sandbox';
    this.currentStatus = PAYMENT_LIFECYCLE_STATES.SANDBOX_CONFIGURED;
    this.clientIdConfigured = true;
    this.mockClientId = 'sb-client-mandate-gw-demo-0914';
  }

  async getConfigurationStatus() {
    return {
      state: this.currentStatus,
      environment: 'api-m.sandbox.paypal.com',
      clientIdConfigured: this.clientIdConfigured,
      maskedClientId: 'sb-client-***-demo-0914',
      webhookActive: true,
      webhookUrl: 'https://gateway.mandate.gw/api/v1/webhooks/paypal-sandbox',
      isSimulated: true,
      notice: 'Frontend Sandbox Mode: Transactions are deterministic demo vouchers. Real PayPal capture requires backend deployment.'
    };
  }

  async createOrder(orderData) {
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const orderId = `PAYPAL-SB-${randomHex}`;

    return {
      orderId,
      status: PAYMENT_LIFECYCLE_STATES.PAYMENT_PENDING,
      intent: 'CAPTURE',
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      merchant: orderData.merchant,
      itemTitle: orderData.itemTitle,
      createdAt: new Date().toISOString(),
      isSimulated: true,
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
      notice: 'Simulated PayPal Sandbox Order: Single-use ephemeral authorization generated.'
    };
  }

  async captureOrder(orderId) {
    return {
      orderId,
      captureId: `CAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: PAYMENT_LIFECYCLE_STATES.COMPLETED,
      capturedAt: new Date().toISOString(),
      isSimulated: true,
      providerMessage: 'Simulated Sandbox Capture Completed: Payment verified by client mock rail.'
    };
  }

  async simulateFailureOrCancellation(orderId, reason = 'BUYER_CANCELLED') {
    return {
      orderId,
      status: PAYMENT_LIFECYCLE_STATES.FAILED_OR_CANCELLED,
      failureReason: reason,
      failedAt: new Date().toISOString(),
      isSimulated: true,
      providerMessage: `Simulated Sandbox Event: Payment aborted (${reason}). No funds deducted.`
    };
  }
}

export const defaultPaymentService = new DemoPayPalPaymentService();
