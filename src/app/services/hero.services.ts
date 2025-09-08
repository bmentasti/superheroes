import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Hero } from '../models/hero';

const seed: Hero[] = [
  { id: '1',  name: 'Superman',     power: 'Flight',         createdAt: Date.now() - 500000, brand: 'DC' },
  { id: '2',  name: 'Spiderman',    power: 'Spider-sense',   createdAt: Date.now() - 400000, brand: 'Marvel' },
  { id: '3',  name: 'Wonder Woman', power: 'Strength',       createdAt: Date.now() - 300000, brand: 'DC' },
  { id: '4',  name: 'Batman',       power: 'Intellect',      createdAt: Date.now() - 200000, brand: 'DC' },
  { id: '5',  name: 'Iron Man',     power: 'Armor',          createdAt: Date.now() - 100000, brand: 'Marvel' },
  { id: '6',  name: 'Captain America', power: 'Super soldier',        createdAt: Date.now() - 90000, brand: 'Marvel' },
  { id: '7',  name: 'Thor',            power: 'God of Thunder',       createdAt: Date.now() - 85000, brand: 'Marvel' },
  { id: '8',  name: 'Hulk',            power: 'Super strength',       createdAt: Date.now() - 80000, brand: 'Marvel' },
  { id: '9',  name: 'Black Widow',     power: 'Espionage',            createdAt: Date.now() - 75000, brand: 'Marvel' },
  { id: '10', name: 'Hawkeye',         power: 'Master archer',        createdAt: Date.now() - 70000, brand: 'Marvel' },
  { id: '11', name: 'Black Panther',   power: 'Enhanced senses',      createdAt: Date.now() - 65000, brand: 'Marvel' },
  { id: '12', name: 'Doctor Strange',  power: 'Sorcery',              createdAt: Date.now() - 60000, brand: 'Marvel' },
  { id: '13', name: 'Scarlet Witch',   power: 'Reality warping',      createdAt: Date.now() - 55000, brand: 'Marvel' },
  { id: '14', name: 'Ant-Man',         power: 'Size shifting',        createdAt: Date.now() - 50000, brand: 'Marvel' },
  { id: '15', name: 'Captain Marvel',  power: 'Cosmic energy',        createdAt: Date.now() - 45000, brand: 'Marvel' },
  { id: '16', name: 'The Flash',       power: 'Super speed',          createdAt: Date.now() - 40000, brand: 'DC' },
  { id: '17', name: 'Green Lantern',   power: 'Power ring constructs',createdAt: Date.now() - 35000, brand: 'DC' },
  { id: '18', name: 'Aquaman',         power: 'Atlantean telepathy',  createdAt: Date.now() - 30000, brand: 'DC' },
  { id: '19', name: 'Cyborg',          power: 'Tech integration',     createdAt: Date.now() - 25000, brand: 'DC' },
  { id: '20', name: 'Supergirl',       power: 'Kryptonian powers',    createdAt: Date.now() - 20000, brand: 'DC' },
  { id: '21', name: 'Batgirl',         power: 'Martial arts',         createdAt: Date.now() - 15000, brand: 'DC' },
  { id: '22', name: 'Green Arrow',     power: 'Master archer',        createdAt: Date.now() - 10000, brand: 'DC' },
  { id: '23', name: 'Shazam',          power: 'Magic lightning',      createdAt: Date.now() - 8000,  brand: 'DC' },
  { id: '24', name: 'Wolverine',       power: 'Healing factor',       createdAt: Date.now() - 6000,  brand: 'Marvel' },
  { id: '25', name: 'Daredevil',       power: 'Radar sense',          createdAt: Date.now() - 4000,  brand: 'Marvel' },
];

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

@Injectable({ providedIn: 'root' })
export class HeroesService {
  private readonly _heroes$ = new BehaviorSubject<Hero[]>(structuredClone(seed));
  readonly heroes$: Observable<Hero[]> = this._heroes$.asObservable();

  getById(id: string): Observable<Hero | undefined> {
    return this.heroes$.pipe(map(list => list.find(h => h.id === id)));
  }

  create(input: Omit<Hero, 'id' | 'createdAt'>): Observable<Hero> {
    const hero: Hero = { ...input, id: crypto.randomUUID(), createdAt: Date.now() };
    this._heroes$.next([hero, ...this._heroes$.value]);
    return of(hero).pipe(delay(200));
  }

  update(id: string, patch: Partial<Hero>): Observable<Hero | undefined> {
    const next = this._heroes$.value.map(h => (h.id === id ? { ...h, ...patch } : h));
    this._heroes$.next(next);
    return this.getById(id).pipe(delay(150));
  }

  remove(id: string): Observable<boolean> {
    const next = this._heroes$.value.filter(h => h.id !== id);
    const removed = next.length !== this._heroes$.value.length;
    this._heroes$.next(next);
    return of(removed).pipe(delay(150));
  }
}
