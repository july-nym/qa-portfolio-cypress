/**
 * BasePage — shared behaviour for every page object.
 * Concrete pages extend this and supply their own `path`.
 */
export abstract class BasePage {
  /** Relative path appended to baseUrl. Override per page. */
  protected abstract readonly path: string;

  /** Navigate to this page using the configured baseUrl. */
  visit(): this {
    cy.visit(this.path);
    return this;
  }

  /** Dismiss the Google consent / ad-block modal that the demo site sometimes shows. */
  dismissConsentIfPresent(): this {
    cy.get('body').then(($body) => {
      const consent = $body.find('.fc-cta-consent, button.fc-button.fc-cta-consent');
      if (consent.length) {
        cy.wrap(consent.first()).click({ force: true });
      }
    });
    return this;
  }

  /** Assert the browser landed on a URL containing the given fragment. */
  assertUrlContains(fragment: string): this {
    cy.url().should('include', fragment);
    return this;
  }
}
