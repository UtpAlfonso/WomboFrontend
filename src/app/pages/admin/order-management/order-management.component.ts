import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Order, OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe], // Añadir pipes para formatear
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  selectedOrder: Order | null = null; // Para mostrar detalles en un modal o panel lateral

  // Lista de estados posibles para el dropdown
  orderStatuses = ['PENDIENTE_PAGO', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO', 'PAGO_FALLIDO'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Carga todos los pedidos desde el backend.
   */
  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        // Ordenamos los pedidos por fecha, del más reciente al más antiguo
        this.orders = data.sort((a, b) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los pedidos', err);
        this.isLoading = false;
        alert('No se pudieron cargar los pedidos.');
      }
    });
  }

  /**
   * Se activa cuando se cambia el estado de un pedido en el selector.
   */
  onStatusChange(orderId: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;

    if (!newStatus) return;

    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        // Actualizar el pedido en la lista local para reflejar el cambio instantáneamente
        const index = this.orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        alert(`Estado del pedido #${orderId} actualizado a ${newStatus}.`);
      },
      error: (err) => {
        console.error('Error al actualizar el estado del pedido', err);
        alert('No se pudo actualizar el estado.');
        // Opcional: recargar la lista para revertir el cambio visual en el select
        this.loadOrders();
      }
    });
  }

  /**
   * Muestra los detalles de un pedido seleccionado.
   */
  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    // En una app más compleja, esto abriría un modal.
    // Aquí, simplemente lo asignamos para mostrarlo en un panel lateral.
  }

  /**
   * Cierra el panel de detalles.
   */
  closeDetailsPanel(): void {
    this.selectedOrder = null;
  }
}