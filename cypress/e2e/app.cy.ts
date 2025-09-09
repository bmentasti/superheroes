describe('App bootstrap', () => {
  it('carga / y redirige a /heroes', () => {
    cy.visit('/');
    cy.url().should('include', '/heroes'); 
    cy.contains(/heroes/i);                
  });
});
