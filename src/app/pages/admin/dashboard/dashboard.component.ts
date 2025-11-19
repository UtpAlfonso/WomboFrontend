import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';


import { Order, OrderService } from '../../../core/services/order.service';
import { Product, ProductService } from '../../../core/services/product.service';
import { User, UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // Indicador de carga
  isLoading = true;

  // Propiedades para las estadísticas
  totalSalesToday: number = 0;
  newOrdersCount: number = 0;
  totalUsers: number = 0;
  outOfStockCount: number = 0;

  // Lista para mostrar los pedidos más recientes
  recentOrders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carga todos los datos necesarios para el dashboard de forma paralela.
   */
  loadDashboardData(): void {
    this.isLoading = true;

    // forkJoin espera a que todas las llamadas HTTP se completen
    forkJoin({
      orders: this.orderService.getAllOrders(),
      products: this.productService.getProducts(),
      users: this.userService.getUsers()
    }).subscribe({
      next: (data) => {
        // Una vez que todos los datos han llegado, los procesamos
        this.processOrders(data.orders);
        this.processProducts(data.products);
        this.processUsers(data.users);
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar los datos del dashboard", err);
        this.isLoading = false;
        alert("No se pudieron cargar los datos del dashboard. Revisa la consola.");
      }
    });
  }

  /**
   * Procesa la lista de pedidos para calcular estadísticas y obtener los más recientes.
   */
  private processOrders(orders: Order[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecer la hora a medianoche para comparar solo la fecha

    const salesToday = orders
      .filter(order => new Date(order.fechaPedido) >= today)
      .reduce((sum, order) => sum + order.total, 0);

    this.totalSalesToday = salesToday;
    
    this.newOrdersCount = orders.filter(order => order.estado === 'PROCESANDO').length;
    
    // Ordenar por fecha y tomar los 5 más recientes
    this.recentOrders = orders
      .sort((a, b) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime())
      .slice(0, 5);
  }

  /**
   * Procesa la lista de productos para contar los que no tienen stock.
   */
  private processProducts(products: Product[]): void {
    this.outOfStockCount = products.filter(product => product.stock === 0).length;
  }

  /**
   * Procesa la lista de usuarios para obtener el conteo total.
   */
  private processUsers(users: User[]): void {
    this.totalUsers = users.length;
  }
}