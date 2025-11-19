import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- INTERFACES PARA UN TIPADO FUERTE ---

/**
 * Representa los datos para un gráfico de ventas diarias.
 */
export interface DailySale {
  date: string; // Formato YYYY-MM-DD
  total: number;
}

/**
 * Representa los datos para un gráfico de productos más vendidos.
 */
export interface ProductSale {
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

/**
 * Representa la estructura completa de la respuesta del reporte de ventas desde el backend.
 */
export interface SalesReport {
  fechaInicio: string;
  fechaFin: string;
  numeroPedidos: number;
  totalVentas: number;
  ventasPorDia: DailySale[];
  topProductosVendidos: ProductSale[];
}


@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene un reporte de ventas completo, incluyendo datos agregados para gráficos,
   * para un rango de fechas específico.
   * (Requiere rol de ADMIN, gestionado por el JWT Interceptor).
   * 
   * @param startDate Fecha de inicio en formato 'YYYY-MM-DD'.
   * @param endDate Fecha de fin en formato 'YYYY-MM-DD'.
   * @returns Un Observable que emite el objeto SalesReport completo.
   */
  getSalesReport(startDate: string, endDate: string): Observable<SalesReport> {
    // Usar HttpParams es la forma correcta y segura de añadir parámetros a una petición GET.
    // Evita problemas con caracteres especiales y codificación de URL.
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    // La petición GET ahora incluirá los parámetros, ej: .../sales?startDate=2025-10-01&endDate=2025-10-31
    return this.http.get<SalesReport>(`${this.apiUrl}/sales`, { params });
  }

  // En el futuro, podrías añadir otros métodos para reportes más específicos, como:
  /*
  getInventoryReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/inventory`);
  }
  */
}