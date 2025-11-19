import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Order, OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-worker-order-management',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './worker-order-management.component.html',
  styleUrls: ['./worker-order-management.component.scss'] // Usaremos un SASS similar al del admin
})
export class WorkerOrderManagementComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  selectedOrder: Order | null = null;
  orderStatuses = ['PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']; // Estados que un trabajador puede gestionar

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
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

  onStatusChange(orderId: number, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    if (!newStatus) return;

    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        alert(`Estado del pedido #${orderId} actualizado.`);
      },
      error: (err) => {
        console.error('Error al actualizar el estado', err);
        alert('No se pudo actualizar el estado.');
        this.loadOrders();
      }
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeDetailsPanel(): void {
    this.selectedOrder = null;
  }
}