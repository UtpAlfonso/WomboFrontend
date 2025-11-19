import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Product, ProductService } from '../../../core/services/product.service';
import { Review, ReviewService } from '../../../core/services/review.service';
import { CartService } from '../../../core/services/CartService';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe, SafeUrlPipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product$: Observable<Product | null> = of(null);
  reviews$: Observable<Review[]> = of([]);
  
  public readonly serverBaseUrl: string;

  isLoading = true;
  error = '';
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private reviewService: ReviewService,
    private cartService: CartService
  ) {
    const url = new URL(environment.apiUrl);
    this.serverBaseUrl = `${url.protocol}//${url.host}`;
  }

  ngOnInit(): void {
    // Get the product ID from the URL parameters
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
       if (!id || isNaN(+id)) {
          this.handleError("ID de producto inválido.");
          return of(null); // Terminar el stream si el ID no es válido
        }

        this.isLoading = true;
        const productId = +id;

        // Use forkJoin to fetch product details and reviews in parallel
        return forkJoin({
          product: this.productService.getProductById(productId),
          reviews: this.reviewService.getReviewsByProduct(productId)
        });
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.product$ = of(data.product);
          this.reviews$ = of(data.reviews);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError("Could not load product details.");
        console.error(err);
        return of(null); 
      }
    });
  }

  /**
   * Handles adding the selected quantity of the product to the cart.
   */
  addToCart(product: Product): void {
    if (this.quantity > product.stock) {
      alert(`Only ${product.stock} items are available.`);
      return;
    }

    this.cartService.addItemToCart({ productoId: product.id, cantidad: this.quantity }).subscribe({
      next: () => {
        alert(`${this.quantity} x ${product.nombre} added to cart!`);
      },
      error: (err) => {
        alert('Could not add to cart. Please make sure you are logged in.');
        console.error(err);
      }
    });
  }

  /**
   * Increases the quantity to be added to the cart.
   */
  increaseQuantity(maxStock: number): void {
    if (this.quantity < maxStock) {
      this.quantity++;
    }
  }

  /**
   * Decreases the quantity to be added to the cart.
   */
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  private handleError(message: string): void {
    this.isLoading = false;
    this.error = message;
    // Optional: redirect to a 404 page or back to catalog after a delay
    // setTimeout(() => this.router.navigate(['/products']), 3000);
  }
}