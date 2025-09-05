import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { Hero } from '../models/hero';
import { HeroesService } from './hero.services';

describe('HeroesService', () => {
  let service: HeroesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroesService);
  });

  it('debería emitir la lista inicial', async () => {
    const list = await firstValueFrom(service.getAll().pipe(take(1)));
    expect(list.length).toBe(25);
  });

  it('getById devuelve el héroe correcto', async () => {
    const hero = await firstValueFrom(service.getById('5'));
    expect(hero?.name).toBe('Iron Man');
  });

  it('getById devuelve undefined si no existe', async () => {
    const hero = await firstValueFrom(service.getById('999'));
    expect(hero).toBeUndefined();
  });

  it('searchByName busca case-insensitive y por subcadena', async () => {
    const results = await firstValueFrom(service.searchByName('  mAn  ').pipe(take(1)));
    const names = results.map((h) => h.name);
    expect(names).toEqual(
      jasmine.arrayContaining([
        'Superman',
        'Spiderman',
        'Batman',
        'Iron Man',
        'Ant-Man',
        'Aquaman',
        'Wonder Woman',
      ]),
    );
  });

  it('add crea id/createdAt y antepone el nuevo héroe', fakeAsync(async () => {
    const before = await firstValueFrom(service.getAll().pipe(take(1)));
    const addedPromise = firstValueFrom(
      service.add({ name: 'Manolito el fuerte', power: 'Fuerza', brand: 'DC' }),
    );
    tick(300);
    const added = await addedPromise;
    expect(added.id).toBeTruthy();
    expect(added.createdAt).toBeTruthy();

    const after = await firstValueFrom(service.getAll().pipe(take(1)));
    expect(after.length).toBe(before.length + 1);
    expect(after[0].id).toBe(added.id);
  }));

  it('update modifica campos del héroe', fakeAsync(async () => {
    const original = await firstValueFrom(service.getById('4'));
    expect(original?.name).toBe('Batman');

    const updatedPromise = firstValueFrom(
      service.update({ ...(original as Hero), power: 'Detective maestro' }),
    );
    tick(300);
    const updated = await updatedPromise;
    expect(updated.power).toBe('Detective maestro');

    const again = await firstValueFrom(service.getById('4'));
    expect(again?.power).toBe('Detective maestro');
  }));

  it('remove elimina por id', fakeAsync(async () => {
    const before = await firstValueFrom(service.getAll().pipe(take(1)));
    const removedIdPromise = firstValueFrom(service.remove('3'));
    tick(300);
    const removedId = await removedIdPromise;
    expect(removedId).toBe('3');

    const after = await firstValueFrom(service.getAll().pipe(take(1)));
    expect(after.length).toBe(before.length - 1);
    expect(after.find((h) => h.id === '3')).toBeUndefined();
  }));
});
