import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { UppercaseDirective } from './uppercase.directive';

@Component({
  standalone: true,
  imports: [UppercaseDirective, ReactiveFormsModule],
  template: `<input appUppercase [formControl]="ctrl" />`,
})
class HostComponent {
  ctrl = new FormControl<string>('', { nonNullable: true });
}

describe('UppercaseDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  });

  it('debería crearse en el host', () => {
    const dir = fixture.debugElement.query(By.directive(UppercaseDirective));
    expect(dir).toBeTruthy();
  });

  it('convierte a mayúsculas y mantiene el caret', () => {
    input.value = 'suPer man';
    input.setSelectionRange(9, 9); 

    let calls = 0;
    const originalDispatch = input.dispatchEvent.bind(input);
    spyOn(input, 'dispatchEvent').and.callFake((ev: Event) => {
      calls++;
      if (calls === 1) {
        return originalDispatch(ev);
      }
      return true;
    });

    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('SUPER MAN');
    expect(input.selectionStart).toBe(9);
    expect(input.selectionEnd).toBe(9);

    expect(calls).toBe(2);
  });

  it('respeta vacíos y no falla sin selección previa', () => {
    input.value = '';
    let calls = 0;
    const originalDispatch = input.dispatchEvent.bind(input);
    spyOn(input, 'dispatchEvent').and.callFake((ev: Event) => {
      calls++;
      if (calls === 1) return originalDispatch(ev);
      return true;
    });

    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('');
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(0);
    expect(calls).toBe(2);
  });
});
