import { Routes } from '@angular/router';
import { HeroesListComponent } from './features/heroes/heroes-list/heroes-list';
import { HeroFormComponent } from './features/heroes/hero-form/hero-form';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'heroes' },
  { path: 'heroes', component: HeroesListComponent },
  { path: 'heroes/new', component: HeroFormComponent },
  { path: 'heroes/:id/edit', component: HeroFormComponent },
  { path: '**', redirectTo: 'heroes' }
];
