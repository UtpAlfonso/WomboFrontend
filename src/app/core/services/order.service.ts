import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaz para el DTO de respuesta de un Pedido
export interface Order {
  id: number;
  fechaPedido: string; // Recibido como string ISO
  estado: string;
  total: number;
  direccionEnvio: string;
  detalles: OrderDetail[];
  // Podríamos añadir el nombre del cliente si el backend lo proporciona
  // clienteNombre?: string; 
}

// Interfaz para el detalle de cada item en un pedido
export interface OrderDetail {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  cantidadDevuelta?: number; // Cantidad ya devuelta, si aplica
}

// Interfaz para la petición de creación de un pedido (usado por el cliente)
export interface OrderRequest {
  direccionEnvio: string;
   paymentData: MercadoPagoPaymentData;
}

export interface MercadoPagoPaymentData {
  token: string;
  paymentMethodId: string;
  installments: number;
  payerEmail: string;
}
export interface PosOrderRequest {
  total: number;
  items: {
    productoId: number;
    quantity: number;
  }[];
}
export interface ReturnRequest {
  pedidoId: number;
  devolverAlStock: boolean;
  items: {
    detallePedidoId: number;
    cantidadADevolver: number;
    motivo: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  // --- MÉTODOS PARA EL CLIENTE ---

  /**
   * Crea una nueva orden a partir del carrito del usuario.
   * (Requiere rol CLIENT).
   */
  createOrder(orderData: OrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  /**
   * Obtiene el historial de pedidos del usuario autenticado.
   * (Requiere rol CLIENT).
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
  }

  // --- MÉTODOS PARA GESTIÓN (ADMIN/WORKER) ---

  /**
   * Obtiene TODOS los pedidos del sistema.
   * (Requiere rol ADMIN o WORKER).
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  /**
   * Obtiene un pedido específico por su ID.
   * (Requiere autenticación. El backend valida si el usuario tiene permiso).
   */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualiza el estado de un pedido.
   * (Requiere rol ADMIN o WORKER).
   */
  updateOrderStatus(id: number, status: string): Observable<Order> {
    // El backend espera recibir el estado como un JSON string.
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, `"${status}"`, { headers });
  }

  /**
   * Genera y descarga la boleta en PDF de un pedido.
   * (Requiere autenticación).
   */
   processReturn(returnData: ReturnRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/returns`, returnData);
  }

  downloadInvoice(orderId: number): Observable<Blob> {
    // La respuesta esperada es un archivo binario (Blob).
    return this.http.get(`${this.apiUrl}/${orderId}/invoice`, { responseType: 'blob' });
  }

  createPhysicalSale(saleData: PosOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/physical-sale`, saleData);
  }
}