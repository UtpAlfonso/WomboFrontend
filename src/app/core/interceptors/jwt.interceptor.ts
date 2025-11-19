// src/app/core/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyecta el servicio de autenticación para obtener el token
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si el token existe, clona la petición y añade la cabecera 'Authorization'
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Deja que la petición continúe su camino
  return next(req);
};