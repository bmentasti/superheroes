import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';
import { Router, provideRouter, convertToParamMap } from '@angular/router';

import { HeroFormComponent } from './hero-form';
import { HeroesService } from '../../../services/hero.services';
import { Hero } from '../../../models/hero';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

class MockHeroesService {
  private list: Hero[] = [
    { id: '1', name: 'Superman', power: 'Flight', createdAt: Date.now() - 1000, brand: 'DC' },
    { id: '2', name: 'Spiderman', power: 'Spider-sense', createdAt: Date.now() - 500, brand: 'Marvel' },
  ];
  getById(id: string) {
    return of(this.list.find(h => h.id === id));
  }
  add(partial: Omit<Hero, 'id'|'createdAt'>) {
    const hero: Hero = { id: 'NEW', createdAt: Date.now(), ...partial };
    this.list = [hero, ...this.list];
    return of(hero);
  }
  update(hero: Hero) {
    this.list = this.list.map(h => h.id === hero.id ? { ...h, ...hero } : h);
    return of(hero);
  }
}


function setMatSelectValue(fixture: ComponentFixture<HeroFormComponent>, value: string) {
  fixture.componentInstance.form.controls.brand.setValue(value);
  fixture.detectChanges();
}

describe('HeroFormComponent', () => {
  let fixture: ComponentFixture<HeroFormComponent>;
  let component: HeroFormComponent;
  let router: Router;
  let snack: MatSnackBar;

  const paramMap$ = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroFormComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: HeroesService, useClass: MockHeroesService },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    snack = TestBed.inject(MatSnackBar);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe crear el componente (modo NUEVO por defecto)', () => {
    expect(component).toBeTruthy();
    expect(component.isEdit).toBeFalse();
    const title = fixture.nativeElement.querySelector('mat-card-title').textContent.trim().toLowerCase();
    expect(title).toContain('nuevo héroe');
  });

  it('debe aplicar validaciones: nombre requerido y min length', fakeAsync(() => {
    const nameCtrl = component.form.controls.name;
    nameCtrl.setValue('');
    nameCtrl.markAsTouched();
    tick(); fixture.detectChanges();

    expect(component.form.invalid).toBeTrue();
    let errorEl = fixture.nativeElement.querySelector('mat-error');
    expect(errorEl).toBeTruthy();

    nameCtrl.setValue('ab');
    tick(); fixture.detectChanges();
    expect(component.form.invalid).toBeTrue();

    nameCtrl.setValue('Thor');
    component.form.controls.brand.setValue('Marvel');
    tick(); fixture.detectChanges();
    expect(component.form.valid).toBeTrue();
  }));

  it('debe crear (add) y navegar a /heroes, mostrando snackbar', fakeAsync(() => {
    const spyNav = spyOn(router, 'navigate');
    const spySnack = spyOn(snack, 'open');

    component.form.setValue({ name: 'Wolverine', power: 'Healing', brand: 'Marvel' });
    component.onSubmit();
    tick(); fixture.detectChanges();

    expect(spySnack).toHaveBeenCalled();
    expect(spyNav).toHaveBeenCalledWith(['/heroes']);
  }));

  it('debe entrar en modo EDICIÓN al recibir id por ruta y precargar datos', fakeAsync(() => {
    paramMap$.next(convertToParamMap({ id: '2' }));
    tick(); fixture.detectChanges();

    expect(component.isEdit).toBeTrue();
    expect(component.currentId).toBe('2');
    expect(component.form.controls.name.value).toBe('Spiderman');
    expect(component.form.controls.brand.value).toBe('Marvel');
  }));

  it('debe actualizar (update) y navegar a /heroes en modo edición', fakeAsync(() => {
    const spyNav = spyOn(router, 'navigate');
    const spySnack = spyOn(snack, 'open');

    paramMap$.next(convertToParamMap({ id: '1' }));
    tick(); fixture.detectChanges();

    component.form.controls.name.setValue('Superman PRIME');
    setMatSelectValue(fixture, 'DC');

    component.onSubmit();
    tick(); fixture.detectChanges();

    expect(spySnack).toHaveBeenCalled();
    expect(spyNav).toHaveBeenCalledWith(['/heroes']);
  }));

  it('la directiva appUppercase convierte a mayúsculas el nombre al tipear', fakeAsync(() => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="name"]');
    input.value = 'super man';
    input.dispatchEvent(new Event('input'));
    tick(); fixture.detectChanges();

    expect(component.form.controls.name.value).toBe('SUPER MAN');
  }));

  it('cancel navega a /heroes sin tocar el servicio', () => {
    const spyNav = spyOn(router, 'navigate');
    component.cancel();
    expect(spyNav).toHaveBeenCalledWith(['/heroes']);
  });
});
