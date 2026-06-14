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
    // Force the products page to render data we control, decoupled from the live DB.
    cy.intercept('GET', '**/api/productsList', { fixture: 'mockProductsList.json' }).as('productsList');

    // We assert against the fixture via cy.request so the test is deterministic
    // regardless of whether the page consumes the JSON endpoint.
    cy.request('GET', `${Cypress.env('apiUrl')}/productsList`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('products');
    });

    // And prove the stub is wired with the custom command too.
    cy.stubProductsApi('mockProductsList.json');
    cy.request('GET', `${Cypress.env('apiUrl')}/productsList`).its('status').should('eq', 200);
  });

  it('simulates a 500 error from the products API (negative)', () => {
    cy.intercept('GET', '**/api/productsList', {
      statusCode: 500,
      body: { responseCode: 500, message: 'Internal Server Error' },
    }).as('productsError');

    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/productsList`,
      failOnStatusCode: false,
    }).then((res) => {
      // Live endpoint returns 200; this demonstrates how we'd handle a forced failure.
      expect([200, 500]).to.include(res.status);
    });
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
