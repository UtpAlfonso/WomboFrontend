import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Pide al backend que cree una preferencia de pago en Mercado Pago.
   * El backend usará el carrito del usuario autenticado para generar esta preferencia.
   * @returns Un Observable con el ID de la preferencia.
   */
  createPreference(): Observable<{ preferenceId: string }> {
    // El cuerpo de la petición es vacío porque el backend obtiene el usuario del token JWT
    return this.http.post<{ preferenceId: string }>(`${this.apiUrl}/create-preference`, {});
  }
}