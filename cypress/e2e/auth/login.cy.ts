import { HomePage, LoginPage } from '../../pages';

describe('Authentication — Login', () => {
  const home = new HomePage();
  const login = new LoginPage();

  beforeEach(() => {
    home.visit().dismissConsentIfPresent().goToLogin();
    cy.contains('Login to your account').should('be.visible');
  });

  it('logs in with valid credentials @smoke', () => {
    // Real account credentials come from env (CYPRESS_USER_EMAIL / _PASSWORD secrets in CI).
    login.login(Cypress.env('userEmail'), Cypress.env('userPassword'));
    home.assertLoggedIn();
  });

  it('rejects an unknown email / password (negative)', () => {
    cy.fixture('users').then(({ invalidUser }) => {
      login.login(invalidUser.email, invalidUser.password);
      login.assertLoginError();
      home.assertLoggedOut();
    });
  });

  it('rejects a valid email with the wrong password (negative)', () => {
    login.login(Cypress.env('userEmail'), 'definitely-not-the-password');
    login.assertLoginError();
  });

  it('does not authenticate when fields are empty (edge case)', () => {
    // HTML5 required validation should block submission and keep us on /login.
    cy.get('[data-qa="login-button"]').click();
    cy.url().should('include', '/login');
    home.assertLoggedOut();
  });
});
