import { ProductsPage } from '../../pages';

describe('Products — Search', () => {
  const products = new ProductsPage();

  beforeEach(() => {
    products.visit().dismissConsentIfPresent();
  });

  it('returns matching products for a valid term @smoke', () => {
    cy.fixture('products').then(({ searchTerms }) => {
      products.search(searchTerms.valid);
      products.assertSearchResultsShown();
      products.assertSomeResultContains(searchTerms.valid);
    });
  });

  it('returns no products for a nonsense term (negative)', () => {
    cy.fixture('products').then(({ searchTerms }) => {
      products.search(searchTerms.noResults);
      products.assertNoResults();
    });
  });

  it('handles special characters without crashing (edge case)', () => {
    cy.fixture('products').then(({ searchTerms }) => {
      products.search(searchTerms.specialChars);
      // Page must remain functional — the searched-products section still renders.
      cy.get('.title').should('be.visible');
    });
  });

  it('treats search as case-insensitive (edge case)', () => {
    // Lower- and upper-case queries should yield the same number of results.
    products.search('dress');
    products.assertSearchResultsShown();
    products.resultCount().then((lowerCount) => {
      products.search('DRESS');
      products.assertSearchResultsShown();
      products.resultCount().should('eq', lowerCount);
    });
  });
});
