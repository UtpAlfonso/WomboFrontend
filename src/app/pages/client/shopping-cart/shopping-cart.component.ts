import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CartItemResponse, CartResponse, CartService } from '../../../core/services/CartService';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, SafeUrlPipe],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  cart: CartResponse | null = null;
  isLoading = true;
  public readonly serverBaseUrl: string;

  constructor(private cartService: CartService) {
    const url = new URL(environment.apiUrl);
    this.serverBaseUrl = `${url.protocol}//${url.host}`;
  }

  ngOnInit(): void {
    this.loadCart();
  }

    resolveImageUrl(path: string | undefined): string {
    if (!path) return '';
    
    // Si la URL ya empieza con http (ej. Cloudinary), devolverla tal cual
    if (path.startsWith('http')) {
      return path;
    }
    
    // Si es una ruta local antigua, agregarle el dominio del backend
    return `${this.serverBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  
  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cart = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el carrito:', err);
        this.isLoading = false;
        alert('No se pudo cargar el carrito. Asegúrate de estar logueado.');
      }
    });
  }

  updateQuantity(item: CartItemResponse, change: number): void {
    const newQuantity = item.cantidad + change;

    // Si la cantidad llega a cero, lo eliminamos
    if (newQuantity < 1) {
      this.removeItem(item.productoId);
      return;
    }

    if (newQuantity > item.productoStock) {
      alert(`No puedes añadir más de ${item.productoStock} unidades.`);
      return;
    }

    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // Llamamos al nuevo método 'updateItemQuantity' con la nueva cantidad TOTAL
    this.cartService.updateItemQuantity(item.productoId, newQuantity).subscribe({
      next: (data) => {
        this.cart = data;
      },
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
        alert(err.error?.message || 'No se pudo actualizar la cantidad.');
      }
    });
  }

  removeItem(productoId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      this.cartService.removeItemFromCart(productoId).subscribe({
        next: (data) => {
          this.cart = data;
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          alert('No se pudo eliminar el producto.');
        }
      });
    }
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.cart = { items: [], total: 0 };
        },
        error: (err) => {
          console.error('Error al vaciar carrito:', err);
          alert('No se pudo vaciar el carrito.');
        }
      });
    }
  }
}