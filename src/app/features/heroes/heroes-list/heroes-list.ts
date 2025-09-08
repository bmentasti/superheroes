import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { combineLatest, map, startWith, Observable } from 'rxjs';

import { HeroesService } from '../../../services/hero.services';
import { Hero } from '../../../models/hero';

function esPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Ítems por página';
  intl.nextPageLabel = 'Siguiente';
  intl.previousPageLabel = 'Anterior';
  intl.firstPageLabel = 'Primera página';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) return `0 de ${length}`;
    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);
    return `${start} – ${end} de ${length}`;
  };
  return intl;
}

@Component({
  standalone: true,
  selector: 'app-heroes-list',
  templateUrl: './heroes-list.html',
  styleUrls: ['./heroes-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useFactory: esPaginatorIntl }],
})
export class HeroesListComponent {
  private readonly heroesSvc = inject(HeroesService);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly search = new FormControl('', { nonNullable: true });
  readonly search$: Observable<string> = this.search.valueChanges.pipe(startWith(''));

  readonly heroes$: Observable<Hero[]> = combineLatest([
    this.heroesSvc.heroes$,
    this.search$,
  ]).pipe(
    map(([heroes, term]) => {
      const t = term.toLowerCase().trim();
      if (!t) return heroes;
      return heroes.filter(
        h => h.name.toLowerCase().includes(t) || h.brand.toLowerCase().includes(t)
      );
    })
  );

  pageIndex = 0;
  pageSize = 5;

  paged$(list$: Observable<Hero[]>): Observable<Hero[]> {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return list$.pipe(map(list => list.slice(start, end)));
  }

  page(evt: PageEvent) {
    this.pageIndex = evt.pageIndex;
    this.pageSize = evt.pageSize;
  }

  async remove(hero: Hero) {
    const { ConfirmDialogComponent } = await import('../../../shared/confirm-dialog/confirm-dialog');
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { title: 'Eliminar héroe', message: `¿Seguro que querés eliminar a "${hero.name}"?` },
      autoFocus: false,
      restoreFocus: false,
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.heroesSvc.remove(hero.id).subscribe(ok => {
        if (ok) this.snack.open('Héroe eliminado', 'OK', { duration: 1800 });
      });
    });
  }
}
