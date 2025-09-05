import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { of, BehaviorSubject } from 'rxjs';
import { Hero } from '../../../models/hero';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeroesListComponent } from './heroes-list';

class MockHeroesService {
  private _list$ = new BehaviorSubject<Hero[]>([
    { id: '1', name: 'Superman', power: 'Flight', createdAt: Date.now(), brand: 'DC' },
    { id: '2', name: 'Spiderman', power: 'Spider-sense', createdAt: Date.now(), brand: 'Marvel' },
    { id: '3', name: 'Batman', power: 'Intellect', createdAt: Date.now(), brand: 'DC' },
    { id: '4', name: 'Iron Man', power: 'Armor', createdAt: Date.now(), brand: 'Marvel' },
    { id: '5', name: 'Ant-Man', power: 'Size shifting', createdAt: Date.now(), brand: 'Marvel' },
    { id: '6', name: 'Aquaman', power: 'Atlantean telepathy', createdAt: Date.now(), brand: 'DC' },
  ]);
  getAll() {
    return this._list$.asObservable();
  }
  remove = jasmine.createSpy('remove').and.callFake((id: string) => {
    this._list$.next(this._list$.value.filter((h) => h.id !== id));
    return of(id);
  });
}

describe('HeroesListComponent', () => {
  let fixture: ComponentFixture<HeroesListComponent>;
  let component: HeroesListComponent;
  let location: Location;
  let svc: MockHeroesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroesListComponent],
      providers: [
        { provide: 'HeroesService', useClass: MockHeroesService },
        provideRouter([
          { path: 'heroes', component: HeroesListComponent },
          { path: 'heroes/new', component: HeroesListComponent },
          { path: 'heroes/:id/edit', component: HeroesListComponent },
        ]),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroesListComponent);
    component = fixture.componentInstance;
    location = TestBed.inject(Location);
    svc = TestBed.inject('HeroesService' as any);
    fixture.detectChanges();
  });

  it('renderiza 5 filas por defecto (pageSize=5)', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);
  }));

  it('filtra por término (e.g., "man")', fakeAsync(() => {
    component.filter.setValue('man');
    fixture.detectChanges();
    tick(300);
    const rows = Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
    const names = rows.map((r: any) => r.cells[0].textContent.trim());

    expect(names.length).toBe(5);
    expect(names.join(' ')).toContain('man'.toUpperCase() ? 'MAN' : 'man');
  }));

  it('al cambiar pageSize a 10 se ven 6 (todos en mock)', fakeAsync(() => {
    component.onPage({ pageIndex: 0, pageSize: 10, length: 6 } as any);
    fixture.detectChanges();
    tick();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(6);
  }));

  it('navega a /heroes/new al hacer click en Añadir', fakeAsync(() => {
    component.onAdd();
    tick();
    expect(location.path()).toContain('/heroes/new');
  }));

  it('navega a /heroes/:id/edit al editar', fakeAsync(() => {
    component.onEdit('3');
    tick();
    expect(location.path()).toContain('/heroes/3/edit');
  }));

  it('borra tras confirmación positiva', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.confirmDelete('2');
    tick();
    expect(svc.remove).toHaveBeenCalledWith('2');
  }));

  it('no borra si el usuario cancela', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.confirmDelete('1');
    tick();
    expect(svc.remove).not.toHaveBeenCalled();
  }));
});
