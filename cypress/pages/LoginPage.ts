import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = '/login';

  private readonly selectors = {
    loginEmail: '[data-qa="login-email"]',
    loginPassword: '[data-qa="login-password"]',
    loginButton: '[data-qa="login-button"]',
    loginError: '.login-form p[style*="color"]',
    signupName: '[data-qa="signup-name"]',
    signupEmail: '[data-qa="signup-email"]',
    signupButton: '[data-qa="signup-button"]',
    signupError: '.signup-form p[style*="color"]',
  };

  login(email: string, password: string): this {
    cy.get(this.selectors.loginEmail).clear().type(email);
    cy.get(this.selectors.loginPassword).clear().type(password, { log: false });
    cy.get(this.selectors.loginButton).click();
    return this;
  }

  startSignup(name: string, email: string): this {
    cy.get(this.selectors.signupName).clear().type(name);
    cy.get(this.selectors.signupEmail).clear().type(email);
    cy.get(this.selectors.signupButton).click();
    return this;
  }

  assertLoginError(message = 'Your email or password is incorrect!'): this {
    cy.get(this.selectors.loginError).should('be.visible').and('contain.text', message);
    return this;
  }

  assertSignupError(message = 'Email Address already exist!'): this {
    cy.get(this.selectors.signupError).should('be.visible').and('contain.text', message);
    return this;
  }
}
