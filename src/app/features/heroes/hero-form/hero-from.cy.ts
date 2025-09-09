import { mount } from 'cypress/angular';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { HeroFormComponent } from './hero-form';
import { HeroesService } from '../../../services/hero.services';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('HeroFormComponent (CT)', () => {
  const fillValidForm = () => {
    cy.get('input[formControlName="name"]').type('Bruce Wayne');
    cy.get('input[formControlName="power"]').type('Intellect');
    cy.get('input[formControlName="brand"]').type('DC');
  };

  it('muestra errores de validación y deshabilita submit cuando es inválido', () => {
    mount(HeroFormComponent, {
      providers: [
        provideRouter([]),
        { provide: HeroesService, useValue: { create: () => of() } },
        { provide: MatSnackBar, useValue: { open: cy.stub().as('snackOpen') } },
      ],
    });

    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('input[formControlName="name"]').focus().blur();
    cy.contains('mat-error', 'El nombre es obligatorio.').should('exist');

    cy.get('input[formControlName="power"]').focus().blur();
    cy.contains('mat-error', 'El poder es obligatorio.').should('exist');

    cy.get('input[formControlName="brand"]').focus().blur();
    cy.contains('mat-error', 'La marca es obligatoria.').should('exist');

    cy.get('input[formControlName="name"]').type('A').blur();
    cy.contains('mat-error', 'Mínimo 2 caracteres.').should('exist');

    cy.contains('a', 'Cancelar')
      .should('have.attr', 'href')
      .and('include', '/heroes');
  });

  it('habilita submit cuando es válido y llama a HeroesService.create con el payload', () => {
    const createStub = cy.stub().as('createStub');
    const snackOpen = cy.stub().as('snackOpen');

    mount(HeroFormComponent, {
      providers: [
        provideRouter([]),
        {
          provide: HeroesService,
          useValue: {
            create: (dto: any) => {
              createStub(dto);
              return of({ ...dto, id: '99', createdAt: Date.now() });
            },
          },
        },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    });

    fillValidForm();

    cy.get('button[type="submit"]').should('not.be.disabled').click();

    cy.get('@createStub').should('have.been.calledOnce');
    cy.get('@createStub').should('have.been.calledWithMatch', {
      name: 'Bruce Wayne',
      power: 'Intellect',
      brand: 'DC',
    });

    cy.get('@snackOpen').should('have.been.calledWithMatch', 'Héroe creado');
  });

  it('muestra snackbar de error si create() falla', () => {
    const snackOpen = cy.stub().as('snackOpen');

    mount(HeroFormComponent, {
      providers: [
        provideRouter([]),
        {
          provide: HeroesService,
          useValue: {
            create: () => throwError(() => new Error('fail')),
          },
        },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    });

    fillValidForm();
    cy.get('button[type="submit"]').click();

    cy.get('@snackOpen').should(
      'have.been.calledWithMatch',
      'No se pudo guardar'
    );
  });
});
