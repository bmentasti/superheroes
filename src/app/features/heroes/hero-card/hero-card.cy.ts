import { mount } from 'cypress/angular';
import { provideRouter } from '@angular/router';
import { HeroCardComponent } from './hero-card';
import { Hero } from '../../../models/hero';

describe('HeroCardComponent (CT)', () => {
  const hero: Hero = {
    id: '1',
    name: 'Batman',
    brand: 'DC',
    power: 'Intellect',
    createdAt: Date.now(),
  };

  it('renderiza nombre, marca y poder', () => {
    mount(HeroCardComponent, {
      componentProperties: { hero },
      providers: [provideRouter([])],
    });

    cy.get('.title').should('contain.text', hero.name);
    cy.get('.brand').should('contain.text', hero.brand);
    cy.get('.power strong').should('contain.text', hero.power);
  });

  it('el link "Editar" apunta a /heroes/:id/edit', () => {
    mount(HeroCardComponent, {
      componentProperties: { hero },
      providers: [provideRouter([])],
    });

    cy.contains('a', 'Editar')
      .should('have.attr', 'href')
      .and('include', `/heroes/${hero.id}/edit`);
  });

  it('emite (delete) con el héroe al hacer click en "Borrar"', () => {
    const onDelete = cy.spy().as('onDelete');

    mount(
      `<app-hero-card [hero]="hero" (delete)="onDelete($event)"></app-hero-card>`,
      {
        imports: [HeroCardComponent],
        providers: [provideRouter([])],
        componentProperties: { hero, onDelete },
      }
    );

    cy.contains('button', 'Borrar').click();

    cy.get('@onDelete').should('have.been.calledOnce');
    cy.get('@onDelete').should('have.been.calledWith', Cypress.sinon.match({
      id: hero.id,
      name: hero.name,
      brand: hero.brand,
      power: hero.power,
    }));
  });
});
