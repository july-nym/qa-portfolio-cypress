import { HomePage, ProductsPage } from '../../pages';

describe('Products — Browsing', () => {
  const home = new HomePage();
  const products = new ProductsPage();

  it('lists all products on the products page @smoke', () => {
    products.visit().dismissConsentIfPresent().assertProductsLoaded();
  });

  it('opens a product detail page from the listing', () => {
    products.visit().dismissConsentIfPresent().viewFirstProduct();
    cy.url().should('include', '/product_details/');
    cy.get('.product-information h2').should('be.visible');
    cy.get('.product-information').should('contain.text', 'Availability');
  });

  it('navigates to products from the home page nav', () => {
    home.visit().dismissConsentIfPresent().goToProducts();
    products.assertProductsLoaded();
  });

  // Multi-viewport: the same browsing assertion across desktop and mobile.
  context('responsive layout', () => {
    const sizes: Array<[string, number, number]> = [
      ['desktop', 1280, 800],
      ['mobile', 375, 667],
    ];

    sizes.forEach(([label, w, h]) => {
      it(`renders the product grid on ${label} (${w}x${h})`, () => {
        cy.viewport(w, h);
        products.visit().dismissConsentIfPresent().assertProductsLoaded();
      });
    });
  });
});
