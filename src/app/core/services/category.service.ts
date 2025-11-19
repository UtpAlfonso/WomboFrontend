import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaz para definir la estructura de una Categoría
export interface Category {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una lista de todas las categorías de productos.
   * (Endpoint público).
   * @returns Un Observable con un array de Categorías.
   */
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  // (Aquí podrías añadir métodos para crear, actualizar y eliminar categorías,
  // que serían utilizados por el panel de administración).
}