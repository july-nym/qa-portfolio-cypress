import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/view_cart';

  private readonly selectors = {
    cartRows: '#cart_info_table tbody tr',
    productNames: '#cart_info_table tbody tr .cart_description h4 a',
    quantity: '.cart_quantity button',
    price: '.cart_price p',
    totalPrice: '.cart_total_price',
    deleteButton: '.cart_quantity_delete',
    proceedToCheckout: '.btn.check_out',
    emptyCart: '#empty_cart',
    registerLoginModalLink: 'u:contains("Register / Login")',
  };

  assertItemCount(count: number): this {
    cy.get(this.selectors.cartRows).should('have.length', count);
    return this;
  }

  assertContainsProduct(name: string): this {
    cy.get(this.selectors.productNames).should('contain.text', name);
    return this;
  }

  assertQuantity(rowIndex: number, qty: number): this {
    cy.get(this.selectors.cartRows).eq(rowIndex).find(this.selectors.quantity).should('have.text', String(qty));
    return this;
  }

  removeFirstItem(): this {
    cy.get(this.selectors.deleteButton).first().click();
    return this;
  }

  assertEmpty(): this {
    cy.get(this.selectors.emptyCart).should('be.visible');
    return this;
  }

  proceedToCheckout(): this {
    cy.get(this.selectors.proceedToCheckout).click();
    return this;
  }

  /** When a guest checks out, a modal offers Register/Login. */
  chooseRegisterLoginFromModal(): this {
    cy.get(this.selectors.registerLoginModalLink).click();
    return this;
  }
}
