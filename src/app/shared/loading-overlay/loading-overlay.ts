import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [NgIf, MatProgressSpinnerModule],
  styles: [`
    .overlay {
      position: fixed; inset: 0; display: grid; place-items: center;
      background: rgba(0,0,0,0.35); backdrop-filter: blur(2px); z-index: 9999;
    }
    .card {
      min-width: 220px; padding: 16px 20px; border-radius: 12px; background: #fff;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18); text-align: center;
      display: grid; gap: 10px; justify-items: center;
      font: 500 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
    }
  `],
  template: `
    <div class="overlay" *ngIf="isLoading()" role="presentation">
      <div class="card" role="status" aria-live="polite" aria-label="Cargando">
        <mat-progress-spinner mode="indeterminate" diameter="36" strokeWidth="3"></mat-progress-spinner>
        <div>Procesando…</div>
      </div>
    </div>
  `,
})
export class LoadingOverlayComponent {
  private loading = inject(LoadingService);
  isLoading = computed(() => this.loading.isLoading());
}
