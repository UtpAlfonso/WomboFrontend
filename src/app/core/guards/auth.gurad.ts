import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos los servicios de Router y AuthService
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si el usuario está autenticado
  if (authService.isAuthenticated()) {
    return true; // Si está autenticado, permite el acceso a la ruta
  }

  // Si no está autenticado, redirige a la página de login
  router.navigate(['/login']);
  return false; // Y bloquea el acceso a la ruta solicitada
};