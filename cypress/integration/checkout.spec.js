/// <reference types="Cypress" />

context('Actions', () => {
  it('can render checkout', () => {
    cy.visit('/gear/gear-3/joust-duffle-bag-1.html')
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

  it('can recover a broken session checkout', () => {
    cy.visit('/men/bottoms-men/shorts-men/shorts-19/cobalt-cooltech-and-trade-fitness-short-898.html')
    cy.addToCart()
    cy.itemsInCart(1)
    cy.goToCart()
    localStorage.setItem('carts/current-cart-hash', 'foo')
    localStorage.setItem('carts/current-cart', 'foo')
    cy.reload()
    cy.url().should('not', 'include', '/checkout')
    cy.visit('/gear/gear-3/joust-duffle-bag-1.html')
    cy.addToCart()
    cy.itemsInCart(2)
    cy.goToCart()
    cy.wait(250)
    cy.url().should('include', '/checkout')
  })
})
