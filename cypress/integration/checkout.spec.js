/// <reference types="Cypress" />

context('Actions', () => {
  it('can render checkout', () => {
    cy.visit('http://localhost:3000/p/24-WB07/overnight-duffle')
    cy.wait(100)
    cy.get(`[data-testid="closeCookieButton"]`).click()
    cy.wait(100)
    cy.get(`[data-testid="addToCart"]`).click()
    cy.get(`[data-testid="notificationAction1"]`).click()
    cy.scrollTo(0, 0)
    cy.get(`[data-testid="minicartCount"]`).contains('1')
    cy.get(`[data-testid="minicartCount"]`).parent().click()
    cy.wait(250)
    cy.get(`[data-testid="subscribeSubmit"]`).first().click()
  })
})
