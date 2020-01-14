/* globals Cypress */
Cypress.Commands.add('iframe', { prevSubject: 'element' }, $iframe => {
  return new Cypress.Promise(resolve => {
    $iframe.on('load', () => {
      resolve($iframe.contents().find('body'))
    })
  })
})

Cypress.Commands.add('addToCart', () => {
  cy.get('[data-testid="addToCart"]').click()
  cy.get('[data-testid=notificationMessage]').contains('Product has been added to the cart!')
  cy.wait(2000)
})

Cypress.Commands.add('itemsInCart', (items) => {
  cy.get(`[data-testid="minicartCount"]`).scrollIntoView().contains(String(items))
})

Cypress.Commands.add('goToCart', () => {
  cy.get(`[data-testid="minicartCount"]`).scrollIntoView().click()
  cy.get(`[data-testid="subscribeSubmit"]`).first().click({ force: true })
})
