/// <reference types="Cypress" />

context('Actions', () => {
  it('can render checkout', () => {
    cy.visit('/gear/gear-3/joust-duffle-bag-1.html')
    cy.wait(100)
    cy.get(`[data-testid="closeCookieButton"]`).click()
    cy.wait(100)
    cy.addToCart()
    cy.itemsInCart(1)
    cy.goToCart()
    cy.wait(2000)
    cy.url().should('include', '/checkout').should(() => {
      // eslint-disable-next-line
      expect(localStorage.getItem('kco/order-id')).to.not.be.undefined
    })
    // cy.get('#klarna-checkout-iframe').iframe().should('contain', 'TEST DRIVE')
  })
})
