import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CartResponse, CartService } from '../../../core/services/CartService';
import { PaymentService } from '../../../core/services/payment.service';
import { environment } from '../../../../environments/environment';

declare var MercadoPago: any;

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './checkout-summary.component.html',
  styleUrls: ['./checkout-summary.component.scss']
})
export class CheckoutSummaryComponent implements OnInit {
  cart: CartResponse | null = null;
  isLoading = true;
  isPreferenceLoading = false;
  
  private mercadopagoInstance: any;

  constructor(
    private cartService: CartService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.initializeMercadoPagoSDK();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().subscribe(data => {
      if (!data || data.items.length === 0) {
        this.router.navigate(['/products']);
        return;
      }
      this.cart = data;
      this.isLoading = false;
      this.createPaymentPreference();
    });
  }

  initializeMercadoPagoSDK(): void {
    if (typeof MercadoPago !== 'undefined') {
      this.mercadopagoInstance = new MercadoPago(environment.mercadopagoPublicKey);
    } else {
      setTimeout(() => this.initializeMercadoPagoSDK(), 200);
    }
  }

  createPaymentPreference(): void {
    this.isPreferenceLoading = true;
    this.paymentService.createPreference().subscribe({
      next: (response) => {
        this.isPreferenceLoading = false;
        this.renderCheckoutButton(response.preferenceId);
      },
      error: (err) => {
        console.error("Error al crear la preferencia de pago", err);
        alert("No se pudo generar el botón de pago.");
        this.isPreferenceLoading = false;
      }
    });
  }

  private renderCheckoutButton(preferenceId: string): void {
    const container = document.querySelector('.checkout-btn-container');
    if (container) {
        container.innerHTML = ''; // Limpiar por si acaso
        this.mercadopagoInstance.checkout({
            preference: {
                id: preferenceId
            },
            render: {
                container: '.checkout-btn-container',
                label: 'Pagar Ahora con Mercado Pago',
            }
        });
    }
  }
}