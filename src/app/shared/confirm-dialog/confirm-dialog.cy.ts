import { mount } from 'cypress/angular';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog';

describe('ConfirmDialogComponent (CT)', () => {
  const data = {
    title: 'Eliminar héroe',
    message: '¿Seguro que querés eliminar a "Hero 1"?',
  };

  const setup = (alias = 'closeSpy') => {
    const closeSpy = cy.stub().as(alias);

    mount(ConfirmDialogComponent, {
      imports: [NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
      ],
    });

    return closeSpy;
  };

  it('renderiza título y mensaje', () => {
    setup();
    cy.get('h2[mat-dialog-title]').should('contain.text', data.title);
    cy.get('mat-dialog-content').should('contain.text', data.message);
  });

  it('clic en "Cancelar" cierra con false', () => {
    setup('closeCancel');
    cy.contains('button', 'Cancelar').click();
    cy.get('@closeCancel').should('have.been.calledOnceWith', false);
  });

  it('clic en "Confirmar" cierra con true', () => {
    setup('closeConfirm');
    cy.contains('button', 'Confirmar').click();
    cy.get('@closeConfirm').should('have.been.calledOnceWith', true);
  });
});
