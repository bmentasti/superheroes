import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _pending = signal(0);

  readonly isLoading = computed(() => this._pending() > 0);

  start() {
    this._pending.update(v => v + 1);
  }

  stop() {
    this._pending.update(v => Math.max(0, v - 1));
  }
}
