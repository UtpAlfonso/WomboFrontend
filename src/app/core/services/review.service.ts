import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaz para los datos que se envían al crear una reseña
export interface ReviewRequest {
  calificacion: number;
  comentario: string;
}

// Interfaz para la respuesta de una reseña
export interface Review {
  id: number;
  nombreUsuario: string;
  calificacion: number;
  comentario: string;
  createdAt: string;
  productoNombre: string;
  productoImageUrl: string;
 // El backend suele enviar las fechas como string ISO
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las reseñas de un producto específico.
   * (Ruta pública).
   * @param productId El ID del producto.
   * @returns Un Observable con un array de Reseñas.
   */
  getReviewsByProduct(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
  }

  /**
   * Crea una nueva reseña para un producto.
   * (Ruta protegida, requiere token JWT).
   * @param productId El ID del producto que se está reseñando.
   * @param reviewData Los datos de la reseña (calificación y comentario).
   * @returns Un Observable con la reseña recién creada.
   */
  create(productId: number, reviewData: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/product/${productId}`, reviewData);
  }

   getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }
  /**
   * Elimina una reseña (función de administrador).
   * (Ruta protegida, requiere token JWT de ADMIN).
   * @param reviewId El ID de la reseña a eliminar.
   * @returns Un Observable vacío.
   */
  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }
}