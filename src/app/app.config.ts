// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';// Importa withInterceptors

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations'; // Importa tu interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Aquí le decimos a Angular que todas las peticiones HTTP deben pasar por nuestro interceptor
    provideHttpClient(withInterceptors([jwtInterceptor])), 
    provideAnimations() 
  ]
};