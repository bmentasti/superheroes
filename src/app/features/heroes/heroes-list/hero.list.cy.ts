import { mount } from 'cypress/angular';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';

import { HeroesListComponent } from './heroes-list';
import { HeroesService } from '../../../services/hero.services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Hero } from '../../../models/hero';

function makeHeroes(n: number): Hero[] {
  const brands = ['DC', 'Marvel'];
  const powers = ['Intellect', 'Flight', 'Strength', 'Spider-sense', 'Armor'];
  return Array.from({ length: n }).map((_, i) => ({
    id: String(i + 1),
    name: `Hero ${i + 1}`,
    brand: brands[i % brands.length],
    power: powers[i % powers.length],
    createdAt: Date.now() - (n - i) * 1000,
  }));
}

describe('HeroesListComponent (CT)', () => {
  const heroes$ = new BehaviorSubject<Hero[]>(makeHeroes(12));

  const makeProviders = (overrides?: Partial<{
    removeSpy: Cypress.Agent<sinon.SinonSpy>;
    snackOpen: Cypress.Agent<sinon.SinonStub>;
    dialogOpen: Cypress.Agent<sinon.SinonStub>;
    dialogResult: boolean;
  }>) => {
    const removeSpy = overrides?.removeSpy ?? cy.stub().as('removeSpy');
    const snackOpen = overrides?.snackOpen ?? cy.stub().as('snackOpen');
    const dialogResult = overrides?.dialogResult ?? true;

    const dialogOpen =
      overrides?.dialogOpen ??
      cy.stub().as('dialogOpen').callsFake(() => ({
        afterClosed: () => of(dialogResult),
      }));

    return [
      provideRouter([]),
      { provide: NoopAnimationsModule, useValue: NoopAnimationsModule },
      {
        provide: HeroesService,
        useValue: {
          heroes$: heroes$.asObservable(),
          remove: (id: string) => {
            removeSpy(id);
            return of(true);
          },
        },
      },
      { provide: MatSnackBar, useValue: { open: snackOpen } },
      { provide: MatDialog, useValue: { open: dialogOpen } },
    ];
  };

  it('renderiza toolbar y el botón "Nuevo" con href a /heroes/new', () => {
    mount(HeroesListComponent, {
      imports: [NoopAnimationsModule],
      providers: makeProviders(),
    });

    cy.contains('mat-toolbar span', 'Superheroes').should('exist');

    cy.contains('a', 'Nuevo')
      .should('have.attr', 'href')
      .and('include', '/heroes/new');
  });

  it('muestra 5 cards en la primera página y el rango "1 – 5 de 12"; al avanzar cambia a "6 – 10 de 12"', () => {
    mount(HeroesListComponent, {
      imports: [NoopAnimationsModule],
      providers: makeProviders(),
    });

    cy.get('.hero-card').should('have.length', 5);
    cy.get('.mat-mdc-paginator-range-label').should('contain.text', '1 – 5 de 12');

    cy.get('button.mat-mdc-paginator-navigation-next').click();

    cy.get('.mat-mdc-paginator-range-label').should('contain.text', '6 – 10 de 12');
    cy.get('.hero-card').should('have.length', 5);
  });

  it('filtra por búsqueda y permite limpiar con el botón de clear', () => {
    mount(HeroesListComponent, {
      imports: [NoopAnimationsModule],
      providers: makeProviders(),
    });

    cy.get('input[placeholder="Nombre o marca..."]').type('Hero 12');
    cy.get('.hero-card').should('have.length', 1);
    cy.contains('.hero-card mat-card-title', 'Hero 12').should('exist');

    cy.get('button[aria-label="clear"]').should('exist').click();
    cy.get('input[placeholder="Nombre o marca..."]').should('have.value', '');
  });

  it('al confirmar borrar: abre diálogo, llama a remove y muestra snackbar', () => {
    const removeSpy = cy.stub().as('removeSpy');
    const snackOpen = cy.stub().as('snackOpen');
    const dialogOpen = cy
      .stub()
      .as('dialogOpen')
      .callsFake(() => ({ afterClosed: () => of(true) }));

    mount(HeroesListComponent, {
      imports: [NoopAnimationsModule],
      providers: makeProviders({ removeSpy, snackOpen, dialogOpen, dialogResult: true }),
    });

    cy.get('.hero-card').first().within(() => {
      cy.contains('button', 'Borrar').click();
    });

    cy.get('@dialogOpen').should('have.been.calledOnce');
    cy.get('@removeSpy').should('have.been.calledOnce');
    cy.get('@snackOpen').should('have.been.calledWithMatch', 'Héroe eliminado');
  });

  it('si se cancela el diálogo, no llama a remove ni muestra snackbar', () => {
    const removeSpy = cy.stub().as('removeSpy');
    const snackOpen = cy.stub().as('snackOpen');
    const dialogOpen = cy
      .stub()
      .as('dialogOpen')
      .callsFake(() => ({ afterClosed: () => of(false) }));

    mount(HeroesListComponent, {
      imports: [NoopAnimationsModule],
      providers: makeProviders({ removeSpy, snackOpen, dialogOpen, dialogResult: false }),
    });

    cy.get('.hero-card').first().within(() => {
      cy.contains('button', 'Borrar').click();
    });

    cy.get('@dialogOpen').should('have.been.calledOnce');
    cy.get('@removeSpy').should('not.have.been.called');
    cy.get('@snackOpen').should('not.have.been.called');
  });
});
