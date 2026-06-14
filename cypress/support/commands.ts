/// <reference types="cypress" />

import { HomePage, LoginPage, ProductsPage } from '../pages';

/**
 * Custom commands keep specs declarative. They wrap the most common,
 * cross-cutting flows (auth, cart seeding, API stubbing) so tests read
 * like a scenario rather than a sequence of clicks.
 */

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

Cypress.Commands.add('loginByUI', (email: string, password: string) => {
  const home = new HomePage();
  const login = new LoginPage();
  home.visit().dismissConsentIfPresent().goToLogin();
  login.login(email, password);
});

/**
 * Faster login that reuses the session across tests via cy.session.
 * The validation step guarantees the cached session is still authenticated.
 */
Cypress.Commands.add('loginBySession', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      const home = new HomePage();
      const login = new LoginPage();
      home.visit().dismissConsentIfPresent().goToLogin();
      login.login(email, password);
      cy.get('a:contains("Logged in as")').should('be.visible');
    },
    {
      validate() {
        cy.visit('/');
        cy.get('a[href="/logout"]').should('exist');
      },
      cacheAcrossSpecs: true,
    }
  );
});

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

Cypress.Commands.add('addProductsToCart', (count: number) => {
  const products = new ProductsPage();
  products.visit().dismissConsentIfPresent();
  for (let i = 0; i < count; i++) {
    products.addProductToCartByIndex(i);
    products.continueShopping();
  }
});

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/** Register a named intercept for the products listing API and alias it. */
Cypress.Commands.add('stubProductsApi', (fixture: string) => {
  cy.intercept('GET', '**/api/productsList', { fixture }).as('productsList');
});

/** Convenience getter — chainable POM-less element by data-qa attribute. */
Cypress.Commands.add('getByQa', (qa: string) => {
  return cy.get(`[data-qa="${qa}"]`);
});

export {};
