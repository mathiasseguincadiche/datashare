declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  'login',
  (email = 'cypress@datashare.fr', password = 'CypressTest123') => {
    cy.visit('/login');
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: { email, password },
      failOnStatusCode: false,
    });
    cy.request('POST', 'http://localhost:3000/auth/login', {
      email,
      password,
    }).then((response) => {
      cy.window().then((win) => {
        win.localStorage.setItem('access_token', response.body.access_token);
      });
    });
  },
);

export {};
