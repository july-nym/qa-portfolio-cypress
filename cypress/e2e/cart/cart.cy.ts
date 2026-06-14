import { ProductsPage, CartPage } from '../../pages';

describe('Cart — Management', () => {
  const products = new ProductsPage();
  const cart = new CartPage();

  beforeEach(() => {
    products.visit().dismissConsentIfPresent();
  });

  it('adds a single product to the cart @smoke', () => {
    products.addProductToCartByIndex(0);
    products.goToCartFromModal();
    cart.assertItemCount(1);
  });

  it('adds multiple distinct products to the cart', () => {
    products.addProductToCartByIndex(0);
    products.continueShopping();
    products.addProductToCartByIndex(1);
    products.goToCartFromModal();
    cart.assertItemCount(2);
  });

  it('increments quantity when the same product is added twice (edge case)', () => {
    products.addProductToCartByIndex(0);
    products.continueShopping();
    products.addProductToCartByIndex(0);
    products.goToCartFromModal();
    // Same product collapses into one row with quantity 2.
    cart.assertItemCount(1);
    cart.assertQuantity(0, 2);
  });

  it('removes a product from the cart', () => {
    products.addProductToCartByIndex(0);
    products.goToCartFromModal();
    cart.assertItemCount(1);
    cart.removeFirstItem();
    cart.assertEmpty();
  });

  it('shows an empty cart for a fresh session (negative/edge case)', () => {
    cart.visit();
    cart.assertEmpty();
  });
});
