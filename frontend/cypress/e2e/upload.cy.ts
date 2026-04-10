describe('Upload de fichier', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/upload');
  });

  it('uploade un fichier et affiche le lien public', () => {
    cy.get('[data-cy=file-input]').selectFile('cypress/fixtures/test-file.txt');
    cy.contains('test-file.txt').should('be.visible');
    cy.get('[data-cy=submit]').click();
    cy.get('[data-cy=download-link]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-cy=download-link]').invoke('val').should('contain', '/download/');
  });

  it('affiche le fichier dans lhistorique apres upload', () => {
    cy.get('[data-cy=file-input]').selectFile('cypress/fixtures/test-file.txt');
    cy.get('[data-cy=submit]').click();
    cy.get('[data-cy=download-link]', { timeout: 15000 }).should('be.visible');
    cy.visit('/history');
    cy.contains('test-file.txt').should('be.visible');
  });
});
