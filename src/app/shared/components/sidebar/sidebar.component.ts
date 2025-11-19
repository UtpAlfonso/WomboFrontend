import { Component, Output, EventEmitter, Input } from '@angular/core'; // <-- 1. Importa 'Input'
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, UserProfile } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // --- 2. AÑADE ESTA LÍNEA ---
  // El decorador @Input permite que el componente padre pase datos a esta propiedad.
  @Input() isOpen = false;

  @Output() closeSidebar = new EventEmitter<void>();
  currentUser$: Observable<UserProfile | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  onLinkClick(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}