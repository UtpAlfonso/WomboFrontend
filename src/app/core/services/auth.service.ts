import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

/**
 * Interfaz que define la estructura del perfil de usuario
 * que se manejará en toda la aplicación.
 */
export interface UserProfile {
  nombre: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base de la API, leída desde los archivos de entorno.
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // BehaviorSubject: Almacena el perfil del usuario actual.
  // Inicia como `null` y notifica a los componentes suscritos cuando cambia (login/logout).
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  
  // Observable público: Los componentes se suscriben a `currentUser$` para reaccionar
  // a los cambios de estado de autenticación en tiempo real.
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Al instanciar el servicio, intenta cargar el usuario desde un token
    // previamente almacenado. Esto mantiene la sesión activa si se refresca la página.
    this.loadUserFromToken();
  }

  /**
   * Envía las credenciales al endpoint de login del backend.
   * Si la autenticación es exitosa, procesa el token JWT recibido.
   * @param credentials Objeto con email y password.
   * @returns Un Observable con la respuesta del backend (que contiene el token).
   */
  login(credentials: any): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.handleAuthentication(response.token);
      })
    );
  }

  /**
   * Envía los datos del nuevo usuario al endpoint de registro del backend.
   * @param userInfo Objeto con nombre, apellido, email y password.
   * @returns Un Observable con la respuesta del backend.
   */
  register(userInfo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userInfo);
  }
  
  /**
   * Envía una solicitud para iniciar el proceso de recuperación de contraseña.
   * @param email Correo del usuario que solicita la recuperación.
   * @returns Un Observable con la respuesta del backend.
   */
 requestPasswordRecovery(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Envía el token de reseteo y la nueva contraseña al backend.
   * @param token El token recibido en la URL del correo.
   * @param newPassword La nueva contraseña establecida por el usuario.
   */
  processResetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }
  /**
   * Cierra la sesión del usuario.
   * Elimina el token del almacenamiento y notifica a la aplicación
   * que ya no hay un usuario autenticado, redirigiendo al login.
   */
  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  /**
   * Getter para obtener el valor síncrono actual del perfil de usuario.
   * Útil para comprobaciones inmediatas.
   */
  public get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene el token JWT del LocalStorage.
   * @returns El token como string, o null si no existe.
   */
  public getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  /**
   * Comprueba si el usuario está autenticado verificando la existencia de un token.
   * @returns `true` si hay un token, `false` en caso contrario.
   */
  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
  * Proceso central para manejar un token JWT: lo guarda, lo decodifica y actualiza
  * el estado del usuario en toda la aplicación.
  * @param token El token JWT recibido del backend.
  */
  private handleAuthentication(token: string): void {
    localStorage.setItem('jwt_token', token);
    const userProfile = this.decodeToken(token);
    this.currentUserSubject.next(userProfile);
  }

  /**
   * Método de inicialización. Carga el perfil del usuario si encuentra un token
   * válido en el almacenamiento local.
   */
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.handleAuthentication(token);
    }
  }

  /**
   * Decodifica un token JWT para extraer el payload (datos del usuario).
   * @param token El token JWT a decodificar.
   * @returns Un objeto `UserProfile` con los datos, o `null` si el token es inválido.
   */
  private decodeToken(token: string): UserProfile | null {
    try {
      const decodedToken: any = jwtDecode(token);
      
      // Asume que el backend incluye estos 'claims' en el payload del JWT.
      return {
        nombre: decodedToken.nombre,
        email: decodedToken.sub, // 'sub' (subject) es el estándar para el identificador/username.
        roles: decodedToken.authorities || [] // 'authorities' es el claim estándar de Spring Security.
      };
    } catch (error) {
      console.error("Token inválido o expirado. Se procederá a cerrar la sesión.", error);
      // Si el token almacenado es inválido (expirado, malformado), se limpia la sesión.
      this.logout();
      return null;
    }
  }
}