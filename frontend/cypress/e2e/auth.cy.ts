describe('Authentification', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('inscrit un nouvel utilisateur', () => {
    const email = `register-${Date.now()}@datashare.fr`;
    const password = 'MotDePasse123';

    cy.visit('/register');
    cy.get('[data-cy=email]').type(email);
    cy.get('[data-cy=password]').type(password);
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/login');
  });

  it('connecte un utilisateur existant et redirige vers upload', () => {
    const email = `login-${Date.now()}@datashare.fr`;
    const password = 'MotDePasse123';

    cy.request('POST', 'http://localhost:3000/auth/register', {
      email,
      password,
    });

    cy.visit('/login');
    cy.get('[data-cy=email]').type(email);
    cy.get('[data-cy=password]').type(password);
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/upload');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('access_token')).to.not.be.null;
    });
  });

  it('rejette des identifiants invalides', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('inexistant@datashare.fr');
    cy.get('[data-cy=password]').type('MauvaisMotDePasse123');
    cy.get('[data-cy=submit]').click();
    cy.contains(/identifiants invalides/i).should('be.visible');
    cy.url().should('include', '/login');
  });

  it('redirige vers login si la route est protegee', () => {
    cy.visit('/upload');
    cy.url().should('include', '/login');
  });
});
