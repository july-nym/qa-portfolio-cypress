import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';

  private readonly selectors = {
    deliveryAddress: '#address_delivery',
    billingAddress: '#address_invoice',
    orderReviewRows: '#cart_info tbody tr',
    commentBox: 'textarea[name="message"]',
    placeOrderButton: 'a[href="/payment"]',
    // Payment form
    nameOnCard: '[data-qa="name-on-card"]',
    cardNumber: '[data-qa="card-number"]',
    cvc: '[data-qa="cvc"]',
    expiryMonth: '[data-qa="expiry-month"]',
    expiryYear: '[data-qa="expiry-year"]',
    payButton: '[data-qa="pay-button"]',
    orderPlaced: '[data-qa="order-placed"], h2:contains("Order Placed")',
    successMessage: '.col-sm-9 p:contains("Congratulations")',
    downloadInvoice: 'a:contains("Download Invoice")',
  };

  assertDeliveryAddressVisible(): this {
    cy.get(this.selectors.deliveryAddress).should('be.visible');
    return this;
  }

  addOrderComment(comment: string): this {
    cy.get(this.selectors.commentBox).clear().type(comment);
    return this;
  }

  placeOrder(): this {
    cy.get(this.selectors.placeOrderButton).click();
    return this;
  }

  payWithCard(card: {
    name: string;
    number: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
  }): this {
    cy.get(this.selectors.nameOnCard).clear().type(card.name);
    cy.get(this.selectors.cardNumber).clear().type(card.number);
    cy.get(this.selectors.cvc).clear().type(card.cvc);
    cy.get(this.selectors.expiryMonth).clear().type(card.expiryMonth);
    cy.get(this.selectors.expiryYear).clear().type(card.expiryYear);
    cy.get(this.selectors.payButton).click();
    return this;
  }

  assertOrderPlaced(): this {
    cy.get(this.selectors.orderPlaced).should('be.visible');
    return this;
  }
}
