import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  protected readonly path = '/products';

  private readonly selectors = {
    searchInput: '#search_product',
    searchButton: '#submit_search',
    searchedProductsTitle: '.title:contains("Searched Products")',
    allProductsTitle: '.title:contains("All Products")',
    productItem: '.features_items .product-image-wrapper',
    productName: '.productinfo p',
    addToCartOverlay: '.product-overlay .add-to-cart',
    addToCartInline: '.productinfo .add-to-cart',
    viewProductLink: 'a[href^="/product_details/"]',
    continueShopping: '.btn-success:contains("Continue Shopping")',
    viewCartModalLink: 'u:contains("View Cart")',
    categoryPanel: '.left-sidebar .category-products',
    brandsPanel: '.brands_products',
  };

  search(term: string): this {
    cy.get(this.selectors.searchInput).clear().type(term);
    cy.get(this.selectors.searchButton).click();
    return this;
  }

  assertSearchResultsShown(): this {
    cy.get(this.selectors.searchedProductsTitle).should('be.visible');
    cy.get(this.selectors.productItem).should('have.length.greaterThan', 0);
    return this;
  }

  assertNoResults(): this {
    cy.get(this.selectors.productItem).should('have.length', 0);
    return this;
  }

  /**
   * The site matches search terms against name, category AND brand, so not every
   * result name contains the term. We only assert at least one result name does.
   */
  assertSomeResultContains(term: string): this {
    cy.get(this.selectors.productName)
      .then(($els) => Cypress._.map($els.toArray(), (el) => el.innerText.toLowerCase()))
      .then((names) => {
        expect(names.some((n) => n.includes(term.toLowerCase())), `a result name contains "${term}"`).to.be
          .true;
      });
    return this;
  }

  /** Number of product cards currently shown — useful for comparison assertions. */
  resultCount(): Cypress.Chainable<number> {
    return cy.get(this.selectors.productItem).its('length');
  }

  assertProductsLoaded(): this {
    cy.get(this.selectors.allProductsTitle).should('be.visible');
    cy.get(this.selectors.productItem).should('have.length.greaterThan', 0);
    return this;
  }

  /** Hover over the nth product (0-based) and add it to the cart via the overlay. */
  addProductToCartByIndex(index: number): this {
    cy.get(this.selectors.productItem)
      .eq(index)
      .within(() => {
        cy.get('.add-to-cart').first().click({ force: true });
      });
    return this;
  }

  continueShopping(): this {
    cy.get(this.selectors.continueShopping).click();
    return this;
  }

  goToCartFromModal(): this {
    cy.get(this.selectors.viewCartModalLink).click();
    return this;
  }

  viewFirstProduct(): this {
    cy.get(this.selectors.viewProductLink).first().click();
    return this;
  }
}
