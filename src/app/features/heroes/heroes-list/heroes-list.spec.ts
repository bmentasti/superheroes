import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { HeroesListComponent } from './heroes-list';
import { HeroesService } from '../../../services/hero.services'; // <-- ajustá si tu path/nombre difiere
import { Hero } from '../../../models/hero';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';

const MOCK_HEROES: Hero[] = [
  { id: '1',  name: 'Superman',     power: 'Flight',       createdAt: Date.now() - 500000, brand: 'DC' },
  { id: '2',  name: 'Spiderman',    power: 'Spider-sense', createdAt: Date.now() - 400000, brand: 'Marvel' },
  { id: '3',  name: 'Wonder Woman', power: 'Strength',     createdAt: Date.now() - 300000, brand: 'DC' },
  { id: '4',  name: 'Batman',       power: 'Intellect',    createdAt: Date.now() - 200000, brand: 'DC' },
  { id: '5',  name: 'Iron Man',     power: 'Armor',        createdAt: Date.now() - 100000, brand: 'Marvel' },
  ...Array.from({ length: 20 }, (_, i) => {
    const n = i + 6;
    return {
      id: String(n),
      name: `Hero ${n}`,
      power: 'Power',
      createdAt: Date.now() - (90000 - i * 1000),
      brand: n % 2 === 0 ? 'Marvel' : 'DC'
    } as Hero;
  }),
];

class MockHeroesService {
  private store = new BehaviorSubject<Hero[]>([...MOCK_HEROES]);
  getAll() { return this.store.asObservable(); }
  remove(id: string) {
    this.store.next(this.store.value.filter(h => h.id !== id));
    return of(id);
  }
}

describe('HeroesListComponent', () => {
  let fixture: ComponentFixture<HeroesListComponent>;
  let component: HeroesListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroesListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: HeroesService, useClass: MockHeroesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const qsa = (sel: string) => Array.from(fixture.nativeElement.querySelectorAll(sel)) as HTMLElement[];
  const firstCellText = () => (fixture.nativeElement.querySelector('tbody tr td')?.textContent ?? '').trim();

  it('renderiza toolbar, filtro y columnas (incluye Marca)', () => {
    expect(fixture.nativeElement.querySelector('mat-toolbar')).toBeTruthy();
    const headers = qsa('thead th').map(th => th.textContent?.trim());
    expect(headers).toContain('Marca');
  });

  it('muestra 5 filas por defecto y usa el label del paginator en español', fakeAsync(() => {
    tick(); fixture.detectChanges();
    expect(qsa('tbody tr').length).toBe(5);

    const intl = TestBed.inject(MatPaginatorIntl);
    expect(intl.itemsPerPageLabel).toBe('Artículos por página');
    expect(intl.getRangeLabel(0, 5, 25)).toBe('1 – 5 de 25');
  }));

  it('filtra por nombre (ej: "man") y resetea a página 0', fakeAsync(() => {
    component.onPage({ pageIndex: 1, pageSize: 5, length: 25, previousPageIndex: 0 } as any);
    tick(); fixture.detectChanges();
    expect(component.pageIndex()).toBe(1);

    component.filter.setValue('man');
    tick(); fixture.detectChanges();

    expect(component.pageIndex()).toBe(0);

    const rows = qsa('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
    const names = rows.map(r => r.querySelector('td')?.textContent?.toLowerCase() ?? '');
    expect(names.some(n => n.includes('man'))).toBeTrue();
  }));

  it('cambia de página con onPage()', fakeAsync(() => {
    component.onPage({ pageIndex: 1, pageSize: 5, length: 25, previousPageIndex: 0 } as any);
    tick(); fixture.detectChanges();
    expect(firstCellText()).toBe('Hero 6');
  }));

  it('cambia pageSize a 10 y muestra 10 filas', fakeAsync(() => {
    component.onPage({ pageIndex: 0, pageSize: 10, length: 25, previousPageIndex: 0 } as any);
    tick(); fixture.detectChanges();
    expect(qsa('tbody tr').length).toBe(10);
  }));

  it('onAdd navega a /heroes/new y onEdit a /heroes/:id/edit', () => {
    const router = TestBed.inject(Router);
    const spyNav = spyOn(router, 'navigate');

    component.onAdd();
    expect(spyNav).toHaveBeenCalledWith(['/heroes/new']);

    spyNav.calls.reset();
    component.onEdit('3');
    expect(spyNav).toHaveBeenCalledWith(['/heroes', '3', 'edit']);
  });

  it('confirmDelete elimina al confirmar y muestra snack', fakeAsync(() => {
    const snack = TestBed.inject(MatSnackBar);
    const spySnack = spyOn(snack, 'open');
    spyOn(window, 'confirm').and.returnValue(true);

    component.confirmDelete('1');
    tick(); fixture.detectChanges();

    expect(spySnack).toHaveBeenCalled();
    expect(component.length()).toBe(24);
  }));

  it('no elimina si se cancela el confirm', fakeAsync(() => {
    const snack = TestBed.inject(MatSnackBar);
    const spySnack = spyOn(snack, 'open');
    spyOn(window, 'confirm').and.returnValue(false);

    component.confirmDelete('2');
    tick(); fixture.detectChanges();

    expect(spySnack).not.toHaveBeenCalled();
    expect(component.length()).toBe(24);
  }));
});
