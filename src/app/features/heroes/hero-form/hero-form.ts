import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';    
import { MatIconModule } from '@angular/material/icon';    

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeroesService } from '../../../services/hero.services';

@Component({
  standalone: true,
  selector: 'app-hero-form',
  templateUrl: './hero-form.html',
  styleUrls: ['./hero-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,        
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,   
    MatIconModule,   
  ],
})
export class HeroFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(HeroesService);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    power: ['', Validators.required],
    brand: ['', Validators.required],
  });

  save() {
    if (this.form.invalid) return;

    this.svc.create(this.form.getRawValue()).subscribe({
      next: (hero) => {
        this.snack.open('Héroe creado', 'OK', { duration: 2000 });
        this.router.navigate(['/heroes', hero.id, 'edit']);
      },
      error: () => this.snack.open('No se pudo guardar', 'Cerrar', { duration: 2500 }),
    });
  }
}
