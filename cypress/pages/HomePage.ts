import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  protected readonly path = '/';

  private readonly selectors = {
    signupLoginLink: 'a[href="/login"]',
    logoutLink: 'a[href="/logout"]',
    deleteAccountLink: 'a[href="/delete_account"]',
    loggedInAs: 'a:contains("Logged in as")',
    productsLink: 'a[href="/products"]',
    cartLink: '.shop-menu a[href="/view_cart"]',
    featuresItems: '.features_items .product-image-wrapper',
    subscriptionEmail: '#susbscribe_email',
    subscribeButton: '#subscribe',
    subscribeSuccess: '#success-subscribe',
  };

  goToLogin(): this {
    cy.get(this.selectors.signupLoginLink).click();
    return this;
  }

  goToProducts(): this {
    cy.get(this.selectors.productsLink).click();
    return this;
  }

  goToCart(): this {
    cy.get(this.selectors.cartLink).first().click();
    return this;
  }

  logout(): this {
    cy.get(this.selectors.logoutLink).click();
    return this;
  }

  deleteAccount(): this {
    cy.get(this.selectors.deleteAccountLink).click();
    return this;
  }

  assertLoggedInAs(name: string): this {
    cy.get(this.selectors.loggedInAs).should('contain.text', name);
    return this;
  }

  /** Assert the user is authenticated without depending on a specific account name. */
  assertLoggedIn(): this {
    cy.get(this.selectors.loggedInAs).should('be.visible');
    cy.get(this.selectors.logoutLink).should('exist');
    return this;
  }

  assertLoggedOut(): this {
    cy.get(this.selectors.signupLoginLink).should('be.visible');
    cy.get(this.selectors.logoutLink).should('not.exist');
    return this;
  }

  assertHomeVisible(): this {
    cy.get(this.selectors.featuresItems).should('have.length.greaterThan', 0);
    return this;
  }

  subscribe(email: string): this {
    cy.get(this.selectors.subscriptionEmail).scrollIntoView().clear().type(email);
    cy.get(this.selectors.subscribeButton).click();
    return this;
  }

  assertSubscribed(): this {
    cy.get(this.selectors.subscribeSuccess).should('be.visible');
    return this;
  }
}
