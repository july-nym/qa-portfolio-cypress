import { HomePage, ProductsPage } from '../../pages';

/**
 * Multi-viewport smoke coverage. Viewport dimensions are data-driven from a
 * fixture so the same scenarios run across desktop, tablet and mobile.
 */
describe('Responsive — Multiple Viewports', () => {
  const home = new HomePage();
  const products = new ProductsPage();

  let viewports: Record<string, { label: string; width: number; height: number }>;

  before(() => {
    cy.fixture('viewports').then((data) => {
      viewports = data;
    });
  });

  const cases = ['desktop', 'tablet', 'mobile'];

  cases.forEach((key) => {
    context(key, () => {
      beforeEach(() => {
        const vp = viewports[key];
        cy.viewport(vp.width, vp.height);
      });

      it(`renders the home page features on ${key}`, () => {
        home.visit().dismissConsentIfPresent().assertHomeVisible();
      });

      it(`renders the products grid on ${key}`, () => {
        products.visit().dismissConsentIfPresent().assertProductsLoaded();
      });
    });
  });
});
