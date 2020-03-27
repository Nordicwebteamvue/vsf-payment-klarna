/* globals Cypress */
Cypress.Commands.add('addToCart', () => {
  cy.wait(2000)
  cy.get('[data-testid="addToCart"]').click({ force: true })
  cy.get('[data-testid=notificationMessage]').contains('Product has been added to the cart!')
  cy.wait(2000)
})

Cypress.Commands.add('itemsInCart', (items) => {
  cy.get('[data-testid="minicartCount"]').scrollIntoView().contains(String(items))
})

Cypress.Commands.add('goToCart', () => {
  cy.get('[data-testid="minicartCount"]').click({ force: true })
  cy.get('[data-testid="subscribeSubmit"]').first().click({ force: true })
})

// https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/
Cypress.Commands.add('getIframeBody', (target) => {
  // get the iframe > document > body
  // and retry until the body element is not empty
  cy.log('getIframeBody')

  return cy
    .get(target, { log: false })
    .its('0.contentDocument.body', { log: false }).should('not.be.empty')
    // wraps "body" DOM element to allow
    // chaining more Cypress commands, like ".find(...)"
    // https://on.cypress.io/wrap
    .then((body) => cy.wrap(body, { log: false }))
})
