import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Exponemos el observable del usuario directamente a la plantilla HTML.
  currentUser$: Observable<UserProfile | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Asignamos el observable del servicio a nuestra variable local.
    this.currentUser$ = this.authService.currentUser$;
  }
  navigateToDashboard(): void {
    const user = this.authService.currentUserValue; // Obtener el perfil del usuario actual
    if (!user) return;

    if (user.roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin']); // Si es Admin, va a /admin
    } else if (user.roles.includes('ROLE_WORKER')) {
      this.router.navigate(['/worker']); // Si es Worker (y no Admin), va a /worker
    }
  }

  /**
   * Determina si el usuario tiene un rol de gestión (Admin o Worker)
   * para decidir si se muestra el botón.
   */
  isManagementUser(user: UserProfile | null): boolean {
    if (!user) return false;
    return user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_WORKER');
  }
  // El método logout llama directamente al servicio.
  // El servicio se encargará de notificar el cambio a través de currentUser$.
  logout(): void {
    this.authService.logout();
  }
}