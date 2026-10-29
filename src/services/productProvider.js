/**
 * ProductProvider Interface & Channel3 Product Discovery Adapter
 * 
 * Mandate Gateway Architecture Boundary:
 * This interface decouples the frontend shopping agent UI from any specific
 * e-commerce scraping or catalog API. The future Express backend or Channel3
 * direct connector can implement this interface without modifying the UI components.
 * 
 * Sponsor Integration: Channel3 (Product Discovery & Structured Search)
 * Status: Interface defined + Deterministic Demo Adapter implemented.
 * Note: Browser code never contains raw Channel3 API secrets. Real API calls
 * are routed through server/ when backend is deployed.
 */

/**
 * @typedef {Object} ProductCandidate
 * @property {string} id
 * @property {string} title
 * @property {string} merchant
 * @property {number} price
 * @property {string} currency
 * @property {string} [model]
 * @property {string} [image]
 * @property {number} [rating]
 * @property {number} [reviewsCount]
 * @property {string} stockNote
 * @property {string} source - e.g. "Channel3 Simulated Catalog" | "Amazon Direct" | "Croma"
 * @property {string} verdict - 'FULL_MATCH_ELIGIBLE' | 'NEEDS_HUMAN_REVIEW' | 'BLOCKED_BY_POLICY' | 'DEALBREAKER_REJECTED'
 * @property {string} clearanceNote
 * @property {string} proofToken
 * @property {Array<{label: string, pass: boolean}>} specs
 * @property {Array<{spec: string, status: string, quote: string}>} [quoteChecks]
 * @property {boolean} isSimulated
 */

/**
 * Base ProductProvider interface definition
 */
export class ProductProvider {
  /**
   * Search candidate products matching natural language prompt and constraints
   * @param {Object} query
   * @param {string} query.prompt
   * @param {string[]} [query.marketplaces]
   * @param {string[]} [query.mustHave]
   * @param {string[]} [query.mustNotHave]
   * @param {number} [query.maxPrice]
   * @returns {Promise<{candidates: ProductCandidate[], totalFound: number, source: string}>}
   */
  async searchCandidates(_query) {
    throw new Error('ProductProvider.searchCandidates must be implemented by subclass');
  }

  /**
   * Get detailed product specifications for a candidate ID
   * @param {string} productId
   * @returns {Promise<ProductCandidate>}
   */
  async getProductDetails(_productId) {
    throw new Error('ProductProvider.getProductDetails must be implemented by subclass');
  }
}

/**
 * Demo Adapter providing deterministic products for hackathon demonstration.
 * Accurately labeled as simulated, reproducing all 6 evaluation scenarios.
 */
export class DemoChannel3ProductProvider extends ProductProvider {
  constructor() {
    super();
    this.name = 'Channel3 Demo Product Discovery Adapter';
    this.isLive = false;
  }

  async searchCandidates(query = {}) {
    // Deterministic catalog containing items for each scenario
    const mockCatalog = [
      {
        id: 'cand-deathadder',
        title: 'Razer DeathAdder Essential Wired Gaming Mouse',
        merchant: 'Amazon India',
        price: 1499,
        currency: 'INR',
        model: 'RZ01-03850100-R3M1',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9Tatw59VFN2ASbvLR92_AcdfiqlekwVZD8rRR6dispVT0e239t3F8hQ-jAVT1JqhQ2f-bnNlz8hhzMnc_p5j9-rguRyC1_yrjyXfMnLqCsmQ9IpqKWV6GqKyZp4oC0roB2MDEH7BgcDWJVzDWXbR3GclOEpiEmn6E9Kp0mlYD4q4UPL_b4esctDlgReQ0KSP0ot1UdiZ5wfSrM5Sfe3DIkds8y2rgEUGeyWjKfxbUq4bVAhzXqzsbgw',
        rating: 4.6,
        reviewsCount: 14820,
        stockNote: 'Prime Verified Stock',
        source: 'Channel3 Simulated Catalog (Amazon India)',
        verdict: 'FULL_MATCH_ELIGIBLE',
        clearanceNote: 'Satisfies all mandatory hardware constraints and lands well within the ₹3,000 autonomous ceiling.',
        proofToken: 'HMAC-SHA256:7f9a...c801 generated (Simulated)',
        specs: [
          { label: 'Wired USB', pass: true },
          { label: '6,400 DPI Optical', pass: true },
          { label: '5 Prog. Buttons', pass: true },
          { label: 'Silent Click Variant', pass: true }
        ],
        quoteChecks: [
          { spec: 'Wired USB', status: 'MATCH', quote: '"Includes 2.1m high-flex Speedflex USB cable for latency-free control."' },
          { spec: '6,400 DPI Optical', status: 'MATCH', quote: '"True 6,400 DPI optical sensor with fast tracking."' },
          { spec: '5 Prog. Buttons', status: 'MATCH', quote: '"Features 5 independently programmable Hyperesponse buttons."' }
        ],
        isSimulated: true,
      },
      {
        id: 'cand-g502',
        title: 'Logitech G502 HERO High Performance Wired Gaming Mouse',
        merchant: 'Croma Retail',
        price: 3895,
        currency: 'INR',
        model: '910-005469',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_2Z9hj5yEiye0NYjH394ThJZiAJBCOPM9n-QRYXzQi4l0TU_ScGjknzZXTBvOXO5aBPQuiuLPyOkqp_ap18ppmNjAiYmIOfuysb3yqg6v6XW4mWGYgmz2pNTteGo-cFu3bwsUMh1lpGGge8jtgbamw85rw6O5r0njCnGv-2moXImdXdDGILOJMZpAAhllDVBpJ1sMUdToeiKDWRU1FYBWDBiwRNpf5E-7epanMdvG9SbJs435dMz48g',
        rating: 4.7,
        reviewsCount: 9240,
        stockNote: 'Tier 1 Croma Verified',
        source: 'Channel3 Simulated Catalog (Croma)',
        verdict: 'NEEDS_HUMAN_REVIEW',
        clearanceNote: 'Clause §4.2 escalation: All hardware specifications match, but price (₹3,895) surpasses the ₹3,000 auto-cap (still within ₹5,000 ceiling).',
        proofToken: 'Pending Human-in-the-Loop approval • Elena Vance queue',
        specs: [
          { label: 'Wired USB', pass: true },
          { label: 'HERO 25K Sensor', pass: true },
          { label: '11 Prog. Buttons', pass: true },
          { label: 'Price > ₹3,000 Auto-Cap', pass: false }
        ],
        quoteChecks: [
          { spec: 'Wired USB', status: 'MATCH', quote: '"Braided USB cable with high durability."' },
          { spec: 'HERO 25K Sensor', status: 'MATCH', quote: '"Sub-micron precision up to 25,600 DPI."' },
          { spec: '11 Prog. Buttons', status: 'MATCH', quote: '"11 customizable buttons with onboard memory."' }
        ],
        isSimulated: true,
      },
      {
        id: 'cand-mxmaster-unauthorized',
        title: 'Logitech MX Master 3S Ergonomic Mouse (Grey Market Import)',
        merchant: 'TechBazaar.in (Unverified)',
        price: 8995,
        currency: 'INR',
        model: '910-006561-UNAUTH',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGqwIsKwfPmOuWi7w8Z-ROPHNTVH4U6UHCMLsJc_BDJso3CMDUp6_VQBcGZ-PmVSTj5_xHpQBAqo5lIC386p8psBsLfD_nhXgbB7SE02dotT-AoVkjNojMzNiink_ga2lITFcOlQ00_nZiLZWha3cxjM27UG6G23bcdg5bZyewTFfWXcxCRJZcCwgKgVJU7iXEfoXU1nZm6ZGWehqpIcUs5yuNBQbDyGmfSDdhauM4zfnthtliCFqyvQ',
        rating: 3.4,
        reviewsCount: 88,
        stockNote: 'Unverified Third-Party Seller',
        source: 'Channel3 Simulated Catalog (TechBazaar)',
        verdict: 'BLOCKED_BY_POLICY',
        clearanceNote: 'Strict mandate rejection: Violates wired constraint (wireless only), seller not in verified whitelist, and price exceeds absolute ₹5,000 limit.',
        proofToken: 'Zero override bypass permitted under mandate rule SEC-0914',
        specs: [
          { label: 'Wired Connection', pass: false },
          { label: 'Whitelisted Merchant', pass: false },
          { label: 'Price Under ₹5,000 Limit', pass: false }
        ],
        quoteChecks: [
          { spec: 'Wired Connection', status: 'VIOLATION', quote: '"Bluetooth Low Energy or Logi Bolt wireless receiver only."' },
          { spec: 'Whitelisted Merchant', status: 'VIOLATION', quote: '"Seller: TechBazaar India (Not in policy whitelist)."' }
        ],
        isSimulated: true,
      },
      {
        id: 'cand-samsung-monitor-overcap',
        title: 'Samsung 27" 4K UHD IPS Ergonomic Commercial Monitor',
        merchant: 'Amazon India',
        price: 28999,
        currency: 'INR',
        model: 'LS27A700NWXXL',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe2vjeSGz7iu-ozjl6LKo9UjGT1H_cIVFq6O0XfXX4Npf4UCCjC1UaL8w33MWegBPsYbinZJYmlhy83k1D7gYhEMPfkxLIJTafbFdpo6_BHR8nzDaXT6FII4xHr-J1ULH2h-LGoPK78hiRApE-NBUyhhzeD89d0_WFJm0Gm0FRilDfVMeKggZLYHnxCJxo8a_brdEqykgW_62aYm_gh55QzQYXY_jl0a4ii-FWANGvY7h1lBfOynSb-w',
        rating: 4.5,
        reviewsCount: 1940,
        stockNote: 'Prime Verified Stock',
        source: 'Channel3 Simulated Catalog (Amazon India)',
        verdict: 'BLOCKED_BY_POLICY',
        clearanceNote: 'Mathematical ceiling breach: Price ₹28,999 exceeds single-item budget ceiling ₹5,000 by ₹23,999. Invariance rule halts transaction.',
        proofToken: 'Hard Stop: Rule CEILING_OVERFLOW triggered',
        specs: [
          { label: 'Merchant Whitelisted', pass: true },
          { label: 'Brand New Condition', pass: true },
          { label: 'Price Under ₹5,000 Limit', pass: false }
        ],
        isSimulated: true,
      }
    ];

    // Filter or adjust based on query parameters if provided
    let results = [...mockCatalog];
    if (query.maxPrice) {
      results = results.filter(r => r.price <= query.maxPrice);
    }

    return {
      candidates: results,
      totalFound: results.length,
      source: 'Channel3 Simulated Product Adapter (Deterministic Hackathon Fixtures)',
      isSimulated: true,
    };
  }

  async getProductDetails(productId) {
    const list = await this.searchCandidates();
    return list.candidates.find(c => c.id === productId) || list.candidates[0];
  }
}

// Default exported singleton provider instance
export const defaultProductProvider = new DemoChannel3ProductProvider();
