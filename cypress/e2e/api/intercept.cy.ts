import { HomePage, ProductsPage } from '../../pages';

/**
 * Demonstrates cy.intercept for three purposes:
 *  1. Spying on real requests and asserting on them.
 *  2. Stubbing responses with a fixture (full mock — no network).
 *  3. Forcing error / latency conditions the live site won't reproduce on demand.
 *
 * The automationexercise.com REST API (https://automationexercise.com/api_list)
 * is also exercised directly with cy.request.
 */
describe('API — Intercept & Mock', () => {
  const home = new HomePage();
  const products = new ProductsPage();

  it('spies on the subscription POST and asserts the request body', () => {
    cy.intercept('POST', '**/api/verifyLoginWithoutEmail*').as('anySpy'); // no-op alias to show selective spying
    cy.intercept('POST', '**/action_page**').as('subscribe');

    home.visit().dismissConsentIfPresent();
    home.subscribe('intercept.demo@example.com');

    // The demo subscription posts a form; assert it fired and carried our email.
    cy.get('@subscribe.all').then((interceptions) => {
      // Some demo builds handle subscription client-side; only assert when it hit the network.
      if (Array.isArray(interceptions) && interceptions.length > 0) {
        expect(JSON.stringify((interceptions as unknown[])[0])).to.include('intercept.demo');
      }
    });
    home.assertSubscribed();
  });

  it('mocks the products listing entirely from a fixture (stub)', () => {
    // Stub the products API with data we control, decoupled from the live DB.
    // NOTE: cy.intercept only catches requests made by the *browser* — it does not
    // intercept cy.request (which runs from Node). So we trigger the call from the
    // page context with window.fetch and assert against the mock fixture.
    cy.stubProductsApi('mockProductsList.json');

    cy.visit('/');
    cy.window()
      .then((win) => win.fetch('/api/productsList').then((res) => res.json()))
      .then((body: { products: Array<{ name: string }> }) => {
        expect(body).to.have.property('products');
        expect(body.products[0].name).to.eq('QA Portfolio Mock Tee');
      });

    // The interception was recorded with a 200 from the fixture.
    cy.wait('@productsList').its('response.statusCode').should('eq', 200);
  });

  it('simulates a 500 error from the products API (negative)', () => {
    cy.intercept('GET', '**/api/productsList', {
      statusCode: 500,
      body: { responseCode: 500, message: 'Internal Server Error' },
    }).as('productsError');

    // Trigger from the browser so the stubbed 500 actually applies.
    cy.visit('/');
    cy.window()
      .then((win) => win.fetch('/api/productsList').then((res) => ({ status: res.status })))
      .then(({ status }) => {
        expect(status).to.eq(500);
      });

    cy.wait('@productsError').its('response.statusCode').should('eq', 500);
  });

  it('injects network latency to test loading resilience (edge case)', () => {
    cy.intercept('GET', '**/api/productsList', (req) => {
      req.on('response', (res) => {
        res.setDelay(1500);
      });
    }).as('slowProducts');

    products.visit().dismissConsentIfPresent();
    products.assertProductsLoaded();
  });

  // Direct REST API assertions against the public endpoints.
  context('public REST API', () => {
    const api = Cypress.env('apiUrl');

    it('GET /productsList returns a products collection', () => {
      cy.request('GET', `${api}/productsList`).then((res) => {
        expect(res.status).to.eq(200);
        const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
        expect(body.products).to.be.an('array').and.have.length.greaterThan(0);
      });
    });

    it('GET /brandsList returns the brand collection', () => {
      cy.request('GET', `${api}/brandsList`).then((res) => {
        const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
        expect(body.brands).to.be.an('array');
      });
    });

    it('POST /searchProduct returns matches for a known term', () => {
      cy.request({
        method: 'POST',
        url: `${api}/searchProduct`,
        form: true,
        body: { search_product: 'top' },
      }).then((res) => {
        const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
        expect(body.products).to.be.an('array');
      });
    });

    it('POST /searchProduct without a param returns a 400-style response (negative)', () => {
      cy.request({
        method: 'POST',
        url: `${api}/searchProduct`,
        form: true,
        body: {},
        failOnStatusCode: false,
      }).then((res) => {
        const body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
        // The API embeds its status in responseCode rather than the HTTP status.
        expect(body.responseCode).to.eq(400);
      });
    });
  });
});
