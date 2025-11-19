import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';


import { Product, ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Review, ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SafeUrlPipe,
    FormsModule // Módulo para el formulario de reseña
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;

   public readonly serverBaseUrl: string;
  
  // --- Lógica del Modal ---
  isReviewModalOpen = false;
  selectedProductForReview: Product | null = null;
  reviewForm!: FormGroup;
  feedbackMessage = '';
  feedbackIsError = false;


  recentReviews: Review[] = [];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private fb: FormBuilder
  ) {const url = new URL(environment.apiUrl);
    this.serverBaseUrl = `${url.protocol}//${url.host}`;}

    isChatOpen = false;
chatInput = '';
chatMessages: { from: 'user' | 'bot', text: string }[] = [
  { from: 'bot', text: '¡Hola! 👋 Soy WomboBot. ¿En qué puedo ayudarte?, Escribe palabras clave como: "hola", "precio", "envio", "horario", "ayuda".' }
];

toggleChat(): void {
  this.isChatOpen = !this.isChatOpen;

  if (this.isChatOpen && this.chatMessages.length === 0) {
    this.chatMessages.push({
      from: 'bot',
      text: '¡Hola! Soy el asistente de Juguetería Wombo Perú 🎁. ".'
    });
  }
}

sendChatMessage(): void {
  if (!this.chatInput.trim()) return;

  this.chatMessages.push({
    from: 'user',
    text: this.chatInput
  });

  const userMessage = this.chatInput.toLowerCase();
  this.chatInput = '';

  // Respuesta automática simple
  setTimeout(() => {
    let botResponse = 'No entendí bien 😅, ¿puedes repetirlo?';

    if (userMessage.includes('hola')) botResponse = '¡Hola! 😊 ¿Cómo te ayudo hoy?';
    if (userMessage.includes('precio')) botResponse = 'Los precios varían según el producto 🎁.';
    if (userMessage.includes('envio')) botResponse = 'Hacemos envíos a todo el Perú 🚚.';
    if (userMessage.includes('horario')) botResponse = 'Atendemos de 9am a 9pm todos los días 🕘.';
    if (userMessage.includes('ayuda')) botResponse = 'Claro, dime en qué necesitas ayuda ❤️.';

    this.chatMessages.push({
      from: 'bot',
      text: botResponse
    });
  }, 600);
}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.isLoading = false;
    });

    this.reviewForm = this.fb.group({
      calificacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.reviewService.getAllReviews().subscribe(data => {
      // Tomamos las 6 reseñas más recientes (ya vienen ordenadas del backend)
      this.recentReviews = data.slice(0, 6);
    });
  }

  // --- Métodos para controlar el Modal ---

  openReviewModal(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para dejar una reseña.');
      return;
    }
    this.selectedProductForReview = product;
    this.isReviewModalOpen = true;
    this.feedbackMessage = '';
    this.reviewForm.reset({ calificacion: 5, comentario: '' });
  }

  closeReviewModal(): void {
    this.isReviewModalOpen = false;
  }

  submitReview(): void {
    if (this.reviewForm.invalid || !this.selectedProductForReview) {
      return;
    }
    
    this.feedbackMessage = '';
    const reviewData = this.reviewForm.value;

    this.reviewService.create(this.selectedProductForReview.id, reviewData).subscribe({
      next: () => {
        this.feedbackIsError = false;
        this.feedbackMessage = '¡Gracias por tu reseña!';
        setTimeout(() => this.closeReviewModal(), 2000); // Cierra el modal tras 2 segundos
      },
      error: (err) => {
        this.feedbackIsError = true;
        this.feedbackMessage = 'Error al enviar la reseña. Inténtalo de nuevo.';
      }
    });
  }
}