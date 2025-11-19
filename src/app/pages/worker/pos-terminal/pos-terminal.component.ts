import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

import { Product, ProductService } from '../../../core/services/product.service';
import { OrderService, PosOrderRequest } from '../../../core/services/order.service';
// import { OrderService } from 'src/app/core/services/order.service'; // Necesitaríamos un nuevo endpoint para ventas físicas

interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-pos-terminal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './pos-terminal.component.html',
  styleUrls: ['./pos-terminal.component.scss']
})
export class PosTerminalComponent implements OnInit {
  searchControl = new FormControl();
  searchResults$: Observable<Product[]> = of([]);
  allProducts: Product[] = [];
  isProcessing = false;

  cart: CartItem[] = [];
  total: number = 0;

  constructor(
    private productService: ProductService, 
    private orderService: OrderService // Inyectar
  ) {} // Inyectar OrderService cuando se cree el endpoint

  ngOnInit(): void {
    // Cargar todos los productos en memoria para búsqueda local
    this.productService.getProducts().subscribe(products => {
      this.allProducts = products;
    });

    // Lógica del buscador
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(term => this.filterProducts(term))
    );
  }

  private filterProducts(term: string): Product[] {
    if (!term || term.length < 2) {
      return [];
    }
    const lowerTerm = term.toLowerCase();
    return this.allProducts.filter(p => p.nombre.toLowerCase().includes(lowerTerm) || p.sku.toLowerCase().includes(lowerTerm)).slice(0, 5);
  }

  addProductToCart(product: Product): void {
    const existingItem = this.cart.find(item => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < existingItem.stock) {
        existingItem.quantity++;
      } else {
        alert('Stock máximo alcanzado para este producto.');
      }
    } else {
      if (product.stock > 0) {
        this.cart.push({ ...product, quantity: 1 });
      } else {
        alert('Este producto no tiene stock.');
      }
    }
    this.searchControl.setValue('');
    this.calculateTotal();
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0 && newQuantity <= item.stock) {
      item.quantity = newQuantity;
    } else if (newQuantity === 0) {
      this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
    }
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total = this.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  }

  finalizeSale(): void {
    if (this.cart.length === 0 || this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    // Preparamos los datos para el DTO del backend
    const saleData: PosOrderRequest = {
      total: this.total,
      items: this.cart.map(item => ({
        productoId: item.id,
        quantity: item.quantity
      }))
    };
    
    // Llamamos al nuevo método del servicio
    this.orderService.createPhysicalSale(saleData).subscribe({
      next: (order) => {
        alert(`Venta #${order.id} registrada con éxito.`);
        this.cart = [];
        this.calculateTotal();
        this.isProcessing = false;
      },
      error: (err) => {
        console.error("Error al registrar la venta:", err);
        alert(`Error: ${err.error.message || 'No se pudo registrar la venta.'}`);
        this.isProcessing = false;
      }
    });
  }
}