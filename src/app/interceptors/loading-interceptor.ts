import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpContextToken,
} from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  const shouldTrack = MUTATING.has(req.method.toUpperCase());

  if (shouldTrack) {
    loading.start();
  }

  return next(req).pipe(
    finalize(() => {
      if (shouldTrack) {
        loading.stop();
      }
    })
  );
};
