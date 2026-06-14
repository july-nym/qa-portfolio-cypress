import { HomePage, LoginPage } from '../../pages';

describe('Authentication — Login', () => {
  const home = new HomePage();
  const login = new LoginPage();

  beforeEach(() => {
    home.visit().dismissConsentIfPresent().goToLogin();
    cy.contains('Login to your account').should('be.visible');
  });

  it('logs in with valid credentials @smoke', () => {
    cy.fixture('users').then(({ validUser, account }) => {
      login.login(validUser.email, validUser.password);
      home.assertLoggedInAs(`${account.firstName} ${account.lastName}`);
    });
  });

  it('rejects an unknown email / password (negative)', () => {
    cy.fixture('users').then(({ invalidUser }) => {
      login.login(invalidUser.email, invalidUser.password);
      login.assertLoginError();
      home.assertLoggedOut();
    });
  });

  it('rejects a valid email with the wrong password (negative)', () => {
    cy.fixture('users').then(({ validUser }) => {
      login.login(validUser.email, 'definitely-not-the-password');
      login.assertLoginError();
    });
  });

  it('does not authenticate when fields are empty (edge case)', () => {
    // HTML5 required validation should block submission and keep us on /login.
    cy.get('[data-qa="login-button"]').click();
    cy.url().should('include', '/login');
    home.assertLoggedOut();
  });
});
