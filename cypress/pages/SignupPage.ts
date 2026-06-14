import { BasePage } from './BasePage';

export interface AccountDetails {
  title: 'Mr' | 'Mrs';
  password: string;
  day: string;
  month: string;
  year: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  address2?: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

/** The "Enter Account Information" form reached after starting signup. */
export class SignupPage extends BasePage {
  protected readonly path = '/signup';

  private readonly selectors = {
    titleMr: '#id_gender1',
    titleMrs: '#id_gender2',
    password: '#password',
    days: '#days',
    months: '#months',
    years: '#years',
    newsletter: '#newsletter',
    offers: '#optin',
    firstName: '#first_name',
    lastName: '#last_name',
    company: '#company',
    address1: '#address1',
    address2: '#address2',
    country: '#country',
    state: '#state',
    city: '#city',
    zipcode: '#zipcode',
    mobile: '#mobile_number',
    createAccountButton: '[data-qa="create-account"]',
    accountCreated: '[data-qa="account-created"]',
    continueButton: '[data-qa="continue-button"]',
  };

  fillAccountDetails(details: AccountDetails): this {
    cy.get(details.title === 'Mr' ? this.selectors.titleMr : this.selectors.titleMrs).check();
    cy.get(this.selectors.password).clear().type(details.password, { log: false });
    cy.get(this.selectors.days).select(details.day);
    cy.get(this.selectors.months).select(details.month);
    cy.get(this.selectors.years).select(details.year);
    cy.get(this.selectors.newsletter).check();
    cy.get(this.selectors.offers).check();
    cy.get(this.selectors.firstName).clear().type(details.firstName);
    cy.get(this.selectors.lastName).clear().type(details.lastName);
    if (details.company) cy.get(this.selectors.company).clear().type(details.company);
    cy.get(this.selectors.address1).clear().type(details.address);
    if (details.address2) cy.get(this.selectors.address2).clear().type(details.address2);
    cy.get(this.selectors.country).select(details.country);
    cy.get(this.selectors.state).clear().type(details.state);
    cy.get(this.selectors.city).clear().type(details.city);
    cy.get(this.selectors.zipcode).clear().type(details.zipcode);
    cy.get(this.selectors.mobile).clear().type(details.mobileNumber);
    return this;
  }

  submit(): this {
    cy.get(this.selectors.createAccountButton).click();
    return this;
  }

  assertAccountCreated(): this {
    cy.get(this.selectors.accountCreated).should('be.visible');
    return this;
  }

  continueAfterCreation(): this {
    cy.get(this.selectors.continueButton).click();
    return this;
  }
}
