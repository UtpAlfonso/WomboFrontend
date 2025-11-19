import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaz para definir la estructura de un Producto
export interface Product {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaNombre: string;
  proveedorNombre: string;
  imageUrl: string | null;
}

// Interfaz para el payload de creación/actualización
export interface ProductRequest {
  sku: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  umbralAlerta: number;
  categoriaId: number;
  proveedorId?: number;
  imageUrl: string;
}


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una lista de todos los productos.
   * @returns Un Observable con un array de Productos.
   */
   getProducts(): Observable<Product[]> {
    console.log(`[ProductService] Enviando petición GET a: ${this.apiUrl}`);

    return this.http.get<Product[]>(this.apiUrl).pipe(
      // 'tap' se ejecuta si la petición tiene éxito
      tap(data => {
        console.log('[ProductService] Petición exitosa. Datos recibidos:', data);
      }),
      // 'catchError' se ejecuta si la petición falla por cualquier motivo
      catchError((error: HttpErrorResponse) => {
        console.error('[ProductService] ¡ERROR EN LA PETICIÓN HTTP!', {
          status: error.status,
          message: error.message,
          url: error.url,
          errorBody: error.error // El cuerpo del error, que puede ser útil
        });
        // Propagar el error para que el componente también lo reciba
        return throwError(() => new Error('Ocurrió un error al obtener los productos.'));
      })
    );
  }

  /**
   * Obtiene un único producto por su ID.
   * @param id El ID del producto a buscar.
   * @returns Un Observable con el objeto Producto.
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo producto.
   * (Ruta protegida, requiere token JWT).
   * @param productData Los datos del nuevo producto.
   * @returns Un Observable con el producto recién creado.
   */
  createProduct(productData: ProductRequest, file?: File): Observable<Product> {
    const formData = new FormData();
    // 1. Añadimos los datos del producto como un 'Blob' de tipo JSON
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

    // 2. Si hay un archivo, lo añadimos
    if (file) {
      formData.append('file', file, file.name);
    }

    // 3. Enviamos el FormData
    return this.http.post<Product>(this.apiUrl, formData);
  }


  /**
   * Actualiza un producto existente.
   * (Ruta protegida, requiere token JWT).
   * @param id El ID del producto a actualizar.
   * @param productData Los nuevos datos del producto.
   * @returns Un Observable con el producto actualizado.
   */
  updateProduct(id: number, productData: ProductRequest, file?: File): Observable<Product> {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Elimina un producto.
   * (Ruta protegida, requiere token JWT).
   * @param id El ID del producto a eliminar.
   * @returns Un Observable vacío.
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}