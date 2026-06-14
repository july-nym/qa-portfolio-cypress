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
      products.assertEveryResultContains(searchTerms.valid);
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
    products.search('DRESS');
    products.assertSearchResultsShown();
    products.assertEveryResultContains('dress');
  });
});
