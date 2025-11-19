import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component'; // <-- 1. Importa el Header
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent, // <-- 2. Añade el Header a los imports
    FooterComponent
  ],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent {}