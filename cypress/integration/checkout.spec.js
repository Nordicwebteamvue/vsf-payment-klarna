/// <reference types="Cypress" />

context('Actions', () => {
  it('can render checkout', () => {
    cy.visit('/gear/gear-3/joust-duffle-bag-1.html')
    cy.wait(100)
    cy.get(`[data-testid="closeCookieButton"]`).click()
    // cy.get(`[data-testid="productLink"]`).first().click()
    cy.wait(100)
    cy.addToCart()
    cy.itemsInCart(1)
    cy.goToCart()
    cy.wait(2000)
    cy.url().should('include', '/checkout')
    cy.get('#klarna-checkout-iframe').iframe().should('contain', 'TEST DRIVE')
  })
})
