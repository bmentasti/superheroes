import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroesList } from './heroes-list';

describe('HeroesList', () => {
  let component: HeroesList;
  let fixture: ComponentFixture<HeroesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
