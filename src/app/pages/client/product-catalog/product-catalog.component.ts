import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable, of } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

import { Product, ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/CartService';
import { Category, CategoryService } from '../../../core/services/category.service';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CurrencyPipe, SafeUrlPipe],
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.scss']
})
export class ProductCatalogComponent implements OnInit {
  
  private allProducts$: Observable<Product[]> = of([]);
  public filteredProducts$: Observable<Product[]> = of([]);
  public categories$: Observable<Category[]> = of([]);
  
  public searchControl = new FormControl('');
  public categoryControl = new FormControl('all');
  public readonly serverBaseUrl: string;
  
  isLoading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private categoryService: CategoryService,
    
  ) {
    const url = new URL(environment.apiUrl);
    this.serverBaseUrl = `${url.protocol}//${url.host}`;
  }

  ngOnInit(): void {
    // 1. Cargar todos los productos y categorías
    this.allProducts$ = this.productService.getProducts();
    this.categories$ = this.categoryService.getAllCategories();

    // 2. Combinar los streams de datos y filtros para la lista filtrada
    this.filteredProducts$ = combineLatest([
      this.allProducts$,
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300)),
      this.categoryControl.valueChanges.pipe(startWith('all'))
    ]).pipe(
      map(([products, searchTerm, selectedCategory]) => {
        this.isLoading = false; // Desactiva el loader una vez que tenemos datos iniciales
        let filtered = products;

        // Filtrar por categoría
        if (selectedCategory && selectedCategory !== 'all') {
          filtered = filtered.filter(p => p.categoriaNombre === selectedCategory);
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
          const lowerCaseSearchTerm = searchTerm.toLowerCase();
          filtered = filtered.filter(p => 
            p.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (p.sku && p.sku.toLowerCase().includes(lowerCaseSearchTerm))
          );
        }
        return filtered;
      })
    );
  }
  // ==========================================
  // MÉTODO NUEVO (Igual que en los otros componentes)
  // ==========================================
  resolveImageUrl(path: string | undefined): string {
    if (!path) return '';
    
    // Si ya es una URL completa (Cloudinary), la devolvemos tal cual
    if (path.startsWith('http')) {
      return path;
    }
    
    // Si es local, le agregamos el dominio del servidor
    return `${this.serverBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  /**
   * Añade un producto al carrito.
   */
  addToCart(productId: number): void {
    this.cartService.addItemToCart({ productoId: productId, cantidad: 1 }).subscribe({
      next: () => alert('Producto añadido al carrito!'),
      error: (err) => {
        console.error('Error al añadir al carrito:', err);
        alert('Error al añadir el producto. Por favor, asegúrate de haber iniciado sesión.');
      }
    });
  }
}