import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Hero } from '../../../models/hero';
import { HeroFormComponent } from './hero-form';

class MockHeroesService {
  private hero: Hero = {
    id: '42',
    name: 'BATMAN',
    power: 'Intellect',
    brand: 'DC',
    createdAt: 111,
  };

  getById = jasmine.createSpy('getById').and.callFake((id: string) => {
    return of(id === '42' ? this.hero : undefined);
  });

  add = jasmine
    .createSpy('add')
    .and.callFake((h: Partial<Hero>) => of({ id: '99', createdAt: Date.now(), ...h } as Hero));
  update = jasmine.createSpy('update').and.callFake((h: Hero) => of(h));
}

describe('HeroFormComponent', () => {
  let fixture: ComponentFixture<HeroFormComponent>;
  let component: HeroFormComponent;
  let router: Router;
  let svc: MockHeroesService;
  let snack: MatSnackBar;

  function configure(routeParams: Record<string, any> = {}) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HeroFormComponent],
      providers: [
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: 'HeroesService', useClass: MockHeroesService },
        provideRouter([{ path: 'heroes', component: HeroFormComponent }]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map(Object.entries(routeParams))),
            snapshot: { paramMap: new Map(Object.entries(routeParams)) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    svc = TestBed.inject('HeroesService' as any);
    snack = TestBed.inject(MatSnackBar);
    fixture.detectChanges();
  }

  it('modo CREATE: muestra título "Nuevo héroe" y crea al enviar', fakeAsync(() => {
    configure();
    expect(component.isEdit).toBeFalse();

    component.form.setValue({ name: 'SUPERMAN', power: 'Flight', brand: 'DC' });
    component.onSubmit();
    tick();

    expect(svc.add).toHaveBeenCalledWith({ name: 'SUPERMAN', power: 'Flight', brand: 'DC' });
    expect(snack.open as any).toHaveBeenCalled();
  }));

  it('modo EDIT: precarga datos y actualiza al enviar', fakeAsync(() => {
    configure({ id: '42' });
    expect(component.isEdit).toBeTrue();
    expect(component.form.value.name).toBe('BATMAN');
    expect(component.originalCreatedAt).toBe(111);

    component.form.patchValue({ power: 'Detective maestro' });
    component.onSubmit();
    tick();

    expect(svc.update).toHaveBeenCalled();
    const arg = svc.update.calls.mostRecent().args[0] as Hero;
    expect(arg.id).toBe('42');
    expect(arg.createdAt).toBe(111);
    expect(arg.power).toBe('Detective maestro');
    expect(snack.open as any).toHaveBeenCalled();
  }));

  it('no envía si el formulario es inválido', fakeAsync(() => {
    configure();
    component.onSubmit();
    tick();
    expect(svc.add).not.toHaveBeenCalled();
    expect(svc.update).not.toHaveBeenCalled();
  }));

  it('cancel navega a /heroes', fakeAsync(() => {
    configure();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    component.cancel();
    tick();
    expect(navigateSpy).toHaveBeenCalledWith(['/heroes']);
  }));

  it('modo EDIT: si id no existe, muestra snack y vuelve a /heroes', fakeAsync(() => {
    configure({ id: '404' });
    component.ngOnInit();
    tick();

    expect(snack.open as any).toHaveBeenCalled();
  }));
});
