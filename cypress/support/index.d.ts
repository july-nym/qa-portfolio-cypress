/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /** Log in through the UI on each call. */
      loginByUI(email: string, password: string): Chainable<void>;

      /** Log in once and reuse the cached session across tests/specs. */
      loginBySession(email: string, password: string): Chainable<void>;

      /** Visit the products page and add the first `count` products to the cart. */
      addProductsToCart(count: number): Chainable<void>;

      /** Intercept GET /api/productsList and respond with the named fixture. */
      stubProductsApi(fixture: string): Chainable<void>;

      /** Select an element by its data-qa attribute. */
      getByQa(qa: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
