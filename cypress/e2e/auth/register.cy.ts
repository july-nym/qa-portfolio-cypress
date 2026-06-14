import { HomePage, LoginPage, SignupPage, AccountDetails } from '../../pages';

describe('Authentication — Register', () => {
  const home = new HomePage();
  const login = new LoginPage();
  const signup = new SignupPage();

  /** A unique email each run so registration always succeeds against the live site. */
  const uniqueEmail = () => `qa.portfolio+${Date.now()}@example.com`;

  beforeEach(() => {
    home.visit().dismissConsentIfPresent().goToLogin();
  });

  it('registers a brand-new account end to end @smoke', () => {
    const email = uniqueEmail();
    cy.fixture('users').then(({ account }) => {
      login.startSignup(`${account.firstName} ${account.lastName}`, email);
      cy.contains('Enter Account Information').should('be.visible');

      signup.fillAccountDetails(account as AccountDetails).submit();
      signup.assertAccountCreated();
      signup.continueAfterCreation();

      home.assertLoggedInAs(`${account.firstName} ${account.lastName}`);

      // Clean up so the account/email can be reused.
      home.deleteAccount();
      cy.get('[data-qa="account-deleted"]').should('be.visible');
    });
  });

  it('blocks signup with an already-registered email (negative)', () => {
    // Uses the real registered account email (env/secret) which already exists.
    cy.fixture('users').then(({ account }) => {
      login.startSignup(`${account.firstName} ${account.lastName}`, Cypress.env('userEmail'));
      login.assertSignupError('Email Address already exist!');
    });
  });

  it('does not start signup with empty name/email (edge case)', () => {
    cy.get('[data-qa="signup-button"]').click();
    cy.url().should('include', '/login');
    cy.contains('Enter Account Information').should('not.exist');
  });
});
