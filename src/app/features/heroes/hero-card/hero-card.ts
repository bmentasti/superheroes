import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Hero } from '../../../models/hero';

@Component({
  standalone: true,
  selector: 'app-hero-card',
  templateUrl: './hero-card.html',
  styleUrls: ['./hero-card.scss'],
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
})
export class HeroCardComponent {
  @Input() hero!: Hero;
  @Output() delete = new EventEmitter<Hero>();
}
