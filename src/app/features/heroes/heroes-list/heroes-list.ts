import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, startWith, map } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

import { HeroesService } from '../../../services/hero.services';
import { Hero } from '../../../models/hero';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

function esPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Artículos por página';
  intl.nextPageLabel = 'Siguiente';
  intl.previousPageLabel = 'Anterior';
  intl.firstPageLabel = 'Primera página';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) return `0 de ${length}`;
    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);
    return `${start} – ${end} de ${length}`;
  };
  return intl;
}

@Component({
  selector: 'app-heroes-list',
  standalone: true,
  providers: [{ provide: MatPaginatorIntl, useFactory: esPaginatorIntl }],
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatToolbarModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, MatCardModule,
    MatPaginatorModule, MatSnackBarModule
  ],
  template: `
<mat-toolbar color="primary" class="toolbar">
  <span>Héroes</span>
  <span class="spacer"></span>
  <button mat-raised-button color="accent" (click)="onAdd()">
    <mat-icon>add</mat-icon> Añadir
  </button>
</mat-toolbar>

<main class="container">
  <mat-card>
    <mat-card-content>
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Filtrar por nombre</mat-label>
          <input matInput [formControl]="filter" placeholder="Ej: man" />
          <button *ngIf="filter.value" matSuffix mat-icon-button aria-label="Limpiar"
                  (click)="filter.setValue('')">
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Poder</th>
              <th>Marca</th>
              <th class="actions-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let h of paginated$ | async; trackBy: trackById">
              <td>{{ h.name }}</td>
              <td>{{ h.power || '—' }}</td>
              <td>{{ h.brand }}</td>
              <td class="row-actions">
                <button mat-icon-button color="primary" (click)="onEdit(h.id)" aria-label="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="confirmDelete(h.id)" aria-label="Borrar">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <mat-paginator
        [length]="length()"
        [pageIndex]="pageIndex()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="[5,10,20]"
        (page)="onPage($event)">
      </mat-paginator>
    </mat-card-content>
  </mat-card>
</main>
`,
  styles: [`
  .toolbar { position: sticky; top: 0; z-index: 2; }
  .spacer { flex: 1 1 auto; }
  .container { max-width: 980px; margin: 16px auto; padding: 0 12px; }
  .filters { margin-bottom: 8px; }
  .table-wrap { overflow: auto; }
  .table { width: 100%; border-collapse: collapse; }
  thead th { text-align: left; border-bottom: 1px solid #e0e0e0; padding: 10px; }
  tbody td { border-bottom: 1px solid #f0f0f0; padding: 10px; }
  .actions-col { width: 128px; }
  .row-actions { display: flex; gap: 6px; }
`]
})
export class HeroesListComponent {
  private svc = inject(HeroesService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  filter = new FormControl('', { nonNullable: true });

  length = signal(0);
  pageIndex = signal(0);
  pageSize = signal(5);

  private pageIndex$ = toObservable(this.pageIndex);
  private pageSize$ = toObservable(this.pageSize);

  private filtered$ = combineLatest([
    this.svc.getAll(),
    this.filter.valueChanges.pipe(startWith(this.filter.value))
  ]).pipe(
    map(([list, term]) => {
      const t = (term ?? '').toLowerCase();
      return t ? list.filter(h => h.name.toLowerCase().includes(t)) : list;
    })
  );

  paginated$ = combineLatest([this.filtered$, this.pageIndex$, this.pageSize$]).pipe(
    map(([list, pageIndex, pageSize]) => {
      this.length.set(list.length);

      const lastPageIndex = Math.max(0, Math.ceil(list.length / pageSize) - 1);
      if (pageIndex > lastPageIndex) {
        this.pageIndex.set(lastPageIndex);
        pageIndex = lastPageIndex;
      }

      const start = pageIndex * pageSize;
      return list.slice(start, start + pageSize);
    })
  );

  constructor() {
    this.filter.valueChanges.subscribe(() => this.pageIndex.set(0));
  }

  onPage(e: PageEvent) {
    if (e.pageSize !== this.pageSize()) this.pageIndex.set(0);
    this.pageSize.set(e.pageSize);
    this.pageIndex.set(e.pageIndex);
  }

  trackById = (_: number, item: Hero) => item.id;

  onAdd() { this.router.navigate(['/heroes/new']); }
  onEdit(id: string) { this.router.navigate(['/heroes', id, 'edit']); }

  confirmDelete(id: string) {
    if (!confirm('¿Seguro que deseas borrar este héroe?')) return;
    this.svc.remove(id).subscribe(() => {
      this.snack.open('Héroe borrado', 'OK', { duration: 2000 });
    });
  }
}
