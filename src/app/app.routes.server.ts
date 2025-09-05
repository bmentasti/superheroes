import { RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },              
  { path: 'heroes', renderMode: RenderMode.Server },
  { path: 'heroes/new', renderMode: RenderMode.Server },
  { path: 'heroes/:id/edit', renderMode: RenderMode.Server }, 
  { path: '**', renderMode: RenderMode.Server },          
];
