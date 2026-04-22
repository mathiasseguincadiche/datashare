describe('Telechargement via lien public', () => {
  let downloadToken = '';

  before(() => {
    cy.login();
    cy.visit('/upload');
    cy.get('[data-cy=file-input]').selectFile('cypress/fixtures/test-file.txt');
    cy.get('[data-cy=submit]').click();
    cy.get('[data-cy=download-link]', { timeout: 15000 })
      .invoke('val')
      .then((url) => {
        downloadToken = String(url).split('/download/')[1];
      });
  });

  it('affiche les informations du fichier', () => {
    cy.clearLocalStorage();
    cy.visit(`/download/${downloadToken}`);
    cy.get('[data-cy=file-info]').should('be.visible');
    cy.get('[data-cy=file-info]').should('contain', 'test-file.txt');
  });

  it('permet de declencher le telechargement', () => {
    cy.clearLocalStorage();
    cy.visit(`/download/${downloadToken}`);
    cy.get('[data-cy=download-btn]').click();
    cy.contains('Fichier téléchargé avec succès').should('be.visible');
  });

  it('affiche une erreur pour un token invalide', () => {
    cy.visit('/download/token-invalide-1234');
    cy.contains(/invalide|expire/i).should('be.visible');
  });
});
