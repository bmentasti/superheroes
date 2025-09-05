import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'input[appUppercase]',
  standalone: true
})
export class UppercaseDirective {
  @HostListener('input', ['$event'])
  onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.value = input.value.toUpperCase();
    input.setSelectionRange(start, end);
    input.dispatchEvent(new Event('input')); 
  }
}
