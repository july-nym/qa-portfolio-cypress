import { HomePage } from '../../pages';

describe('Authentication — Logout', () => {
  const home = new HomePage();

  it('logs the user out and returns to a guest state @smoke', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.loginByUI(validUser.email, validUser.password);
      cy.get('a:contains("Logged in as")').should('be.visible');

      home.logout();
      cy.url().should('include', '/login');
      home.assertLoggedOut();
    });
  });

  it('keeps protected actions unavailable after logout (edge case)', () => {
    cy.fixture('users').then(({ validUser }) => {
      cy.loginByUI(validUser.email, validUser.password);
      home.logout();
      // The delete-account link is only present while authenticated.
      cy.get('a[href="/delete_account"]').should('not.exist');
    });
  });
});
