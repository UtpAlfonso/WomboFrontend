import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// DTO para añadir/quitar un item
export interface CartItemRequest {
  productoId: number;
  cantidad: number;
}

// DTO para un item del carrito en la respuesta del backend
export interface CartItemResponse {
  productoId: number;
  productoNombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  productoImageUrl: string; // Añadir para mostrar imagen en el carrito
  productoStock: number; // Añadir para validación de stock
}

// DTO para la respuesta completa del carrito
export interface CartResponse {
  items: CartItemResponse[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el contenido del carrito del usuario autenticado.
   */
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl);
  }

  /**
   * Añade un producto al carrito o actualiza su cantidad si ya existe.
   */
  addItemToCart(item: CartItemRequest): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}/items`, item);
  }

  /**
   * Elimina un producto específico del carrito.
   */
  removeItemFromCart(productoId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.apiUrl}/items/${productoId}`);
  }

   updateItemQuantity(productoId: number, cantidad: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.apiUrl}/items/${productoId}`, { cantidad });
  }

  /**
   * Vacía completamente el carrito del usuario.
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}