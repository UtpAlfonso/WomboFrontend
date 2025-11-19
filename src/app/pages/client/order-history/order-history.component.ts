import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Order, OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadMyOrders();
  }

  loadMyOrders(): void {
    this.isLoading = true;
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        // Ordenar del más reciente al más antiguo
        this.orders = data.sort((a, b) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial de pedidos:', err);
        this.isLoading = false;
        alert('No se pudo cargar tu historial de pedidos. Asegúrate de haber iniciado sesión.');
      }
    });
  }

  downloadInvoice(orderId: number): void {
    this.orderService.downloadInvoice(orderId).subscribe({
      next: (blob) => {
        // Crear un objeto URL para el Blob y usarlo para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boleta-pedido-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url); // Liberar la URL del objeto
        a.remove(); // Eliminar el elemento 'a'
      },
      error: (err) => {
        console.error('Error al descargar la boleta:', err);
        alert('No se pudo descargar la boleta. Inténtalo de nuevo.');
      }
    });
  }
}