import { ProductsPage, CartPage, CheckoutPage, HomePage } from '../../pages';

describe('Checkout — Process', () => {
  const products = new ProductsPage();
  const cart = new CartPage();
  const checkout = new CheckoutPage();
  const home = new HomePage();

  it('completes checkout and places an order for a logged-in user @smoke', () => {
    cy.fixture('users').then(({ validUser, card }) => {
      // Authenticate via cached session for speed, then seed the cart.
      cy.loginBySession(validUser.email, validUser.password);
      cy.addProductsToCart(2);

      cart.visit();
      cart.assertItemCount(2);
      cart.proceedToCheckout();

      checkout.assertDeliveryAddressVisible();
      checkout.addOrderComment('Please leave at the front desk — QA portfolio order.');
      checkout.placeOrder();

      checkout.payWithCard(card);
      checkout.assertOrderPlaced();
    });
  });

  it('prompts a guest to register/login before checkout (negative)', () => {
    // Ensure we are logged out.
    cy.clearCookies();
    cy.addProductsToCart(1);
    cart.visit();
    cart.proceedToCheckout();
    // Guests get a modal rather than the checkout page.
    cy.contains('Register / Login account to proceed on checkout.').should('be.visible');
    cart.chooseRegisterLoginFromModal();
    cy.url().should('include', '/login');
  });

  it('cannot proceed to checkout with an empty cart (edge case)', () => {
    cy.clearCookies();
    cart.visit();
    cart.assertEmpty();
    // The proceed-to-checkout button is not rendered when the cart is empty.
    cy.get('.btn.check_out').should('not.exist');
  });

  afterEach(() => {
    // Leave the suite in a clean, logged-out state.
    cy.clearCookies();
  });
});
