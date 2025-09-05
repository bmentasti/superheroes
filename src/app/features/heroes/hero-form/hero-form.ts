import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap, of } from 'rxjs';

import { HeroesService } from '../../../services/hero.services';
import { UppercaseDirective } from '../../../shared/uppercase.directive';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    UppercaseDirective,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  template: `
    <main class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon aria-hidden="true" style="vertical-align: middle; margin-right: 6px;">
              {{ isEdit ? 'edit' : 'person_add' }}
            </mat-icon>
            {{ isEdit ? 'Editar héroe' : 'Nuevo héroe' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>Nombre *</mat-label>
              <input
                matInput
                formControlName="name"
                appUppercase
                placeholder="Ej: Superhéroe"
                required
              />
              <mat-error
                *ngIf="form.controls.name.touched && form.controls.name.errors?.['required']"
              >
                El nombre es requerido.
              </mat-error>
              <mat-error
                *ngIf="form.controls.name.touched && form.controls.name.errors?.['minlength']"
              >
                Debe tener al menos 3 caracteres.
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Poder *</mat-label>
              <input matInput formControlName="power" placeholder="Ej: Vuelo" required />
              <mat-error
                *ngIf="form.controls.power.touched && form.controls.power.errors?.['required']"
              >
                El poder es requerido.
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Marca</mat-label>
              <mat-select formControlName="brand">
                <mat-option value="Marvel">Marvel</mat-option>
                <mat-option value="DC">DC</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="buttons">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
                {{ isEdit ? 'Guardar' : 'Crear' }}
              </button>
              <button mat-button type="button" (click)="cancel()">
                <mat-icon>close</mat-icon> Cancelar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </main>
  `,
  styles: [
    `
      .container {
        max-width: 720px;
        margin: 16px auto;
        padding: 0 12px;
      }
      .form {
        display: grid;
        gap: 14px;
        margin-top: 8px;
      }
      .buttons {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }
    `,
  ],
})
export class HeroFormComponent implements OnInit {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(HeroesService);
  private snack = inject(MatSnackBar);

  isEdit = false;
  currentId: string | null = null;
  originalCreatedAt: number | null = null;

  form = this.fb.group({
    name: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
    power: this.fb.control<string>('', [Validators.required]),
    brand: this.fb.control<string>('Marvel'),
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isEdit = true;
            this.currentId = id;
            return this.svc.getById(id);
          }
          this.isEdit = false;
          return of(undefined);
        }),
      )
      .subscribe((hero) => {
        if (hero) {
          this.form.patchValue({
            name: hero.name,
            power: hero.power ?? '',
            brand: hero.brand ?? 'Marvel',
          });
          this.originalCreatedAt = hero.createdAt ?? null;
        }
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, power, brand } = this.form.getRawValue();

    if (this.isEdit && this.currentId) {
      this.svc
        .update({
          id: this.currentId,
          createdAt: this.originalCreatedAt ?? Date.now(),
          name,
          power,
          brand,
        })
        .subscribe(() => {
          this.snack.open('Héroe actualizado', 'OK', { duration: 2000 });
          this.router.navigate(['/heroes']);
        });
    } else {
      this.svc.add({ name, power, brand }).subscribe(() => {
        this.snack.open('Héroe creado', 'OK', { duration: 2000 });
        this.router.navigate(['/heroes']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/heroes']);
  }
}
